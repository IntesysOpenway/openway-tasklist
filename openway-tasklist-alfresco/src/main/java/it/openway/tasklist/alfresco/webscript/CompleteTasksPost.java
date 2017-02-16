/*-
 * ==============================LICENSE=============================
 * Intesys Openway Tasklist - Alfresco
 * %%
 * Copyright (C) 2016 - 2017 Intesys Openway Srl
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Lesser Public License for more details.
 * 
 * You should have received a copy of the GNU General Lesser Public
 * License along with this program.  If not, see
 * <http://www.gnu.org/licenses/lgpl-3.0.html>.
 * ============================LICENSE-END===========================
 */
package it.openway.tasklist.alfresco.webscript;

import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.transaction.UserTransaction;

import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.security.authentication.AuthenticationUtil.RunAsWork;
import org.alfresco.service.cmr.workflow.WorkflowService;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.alfresco.service.transaction.TransactionService;
import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;
import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.util.Assert;

/**
 * Webscript che si occupa della chiusura di una lista di task impostando lo stesso outcome.
 * <p>
 * 
 * @author RuuD
 */
public class CompleteTasksPost extends DeclarativeWebScript {

    private final static Logger logger = Logger.getLogger(CompleteTasksPost.class);

    private WorkflowService workflowService;
    private NamespaceService namespaceService;
    private TransactionService transactionService;

    @Override
    protected Map<String, Object> executeImpl(WebScriptRequest req, Status status, Cache cache) {

        List<String> taskIds = new ArrayList<>();
        String transitionId = null;
        HashMap<String, Serializable> properties = null;
        try {
            JSONObject params = new JSONObject(new JSONTokener(req.getContent().getContent()));

            transitionId = params.has("transitionId") ? params.getString("transitionId") : null;

            if (params.has("properties") && !params.isNull("properties")) {
                JSONObject json = params.getJSONObject("properties");
                properties = new HashMap<>(json.length() + 1);
                @SuppressWarnings("unchecked")
                Iterator<String> ite = json.keys();
                while (ite.hasNext()) {
                    String key = ite.next();
                    properties.put(key, (Serializable) json.get(key));
                }

            }

            JSONArray array = params.getJSONArray("taskIds");
            Assert.isTrue(array != null && array.length() > 0, "Nessun task selezionato.");
            for (int i = 0; i < array.length(); i++) {
                taskIds.add(array.getString(i));
            }
        }
        catch (IllegalArgumentException ex) {
            return createResponse(ex.getMessage());
        }
        catch (IOException | JSONException ex) {
            logger.error("Errore nel recupero dei parametri del webscript: " + ex.getMessage());
            throw new AlfrescoRuntimeException(ex.getMessage(), ex.getCause());
        }

        List<String> errors = new ArrayList<>();
        for (int i = 0; i < taskIds.size(); i++) {
            String error = completeTask(taskIds.get(i), transitionId, properties);
            if (error != null) {
                errors.add(error);
            }
        }

        return createResponse(errors, taskIds);
    }

    /**
     * Chiude il task indicato all'interno di una transazione a sé stante.
     * <p>
     * In caso di errore, restituisce un messaggio.
     * <p>
     * 
     * @param taskId
     * @param transitionId
     * @param properties
     * @return errore
     */
    private String completeTask(final String taskId, final String transitionId, final HashMap<String, Serializable> properties) {

        final String owner = AuthenticationUtil.getFullyAuthenticatedUser();
        return AuthenticationUtil.runAsSystem(new RunAsWork<String>() {

            @Override
            public String doWork()
                throws Exception {

                UserTransaction tx = transactionService.getNonPropagatingUserTransaction();
                try {
                    tx.begin();
                    HashMap<QName, Serializable> props = new HashMap<>();
                    if (properties != null) {
                        for (String key : properties.keySet()) {
                            props.put(QName.createQName(key, namespaceService), properties.get(key));
                        }
                    }
                    props.put(ContentModel.PROP_OWNER, owner);
                    workflowService.updateTask(taskId, props, null, null);
                    workflowService.endTask(taskId, transitionId);
                    tx.commit();
                    return null;
                }
                catch (Throwable ex) {
                    tx.rollback();
                    while (ex.getCause() != null && ex != ex.getCause()) {
                        ex = ex.getCause();
                    }
                    String desc = workflowService.getTaskById(taskId).getDescription();
                    return "[" + desc + "] - " + ex.getMessage();
                }
            }

        });
    }

    private Map<String, Object> createResponse(List<String> errors, List<String> items) {

        StringBuffer msg = new StringBuffer();
        msg.append("Task completati: " + (items.size() - errors.size()) + " di " + items.size());

        if (!errors.isEmpty()) {
            msg.append("\nErrori rilevati:");
            for (String s : errors) {
                msg.append("\n" + s);
            }
        }

        return createResponse(msg.toString());
    }

    private Map<String, Object> createResponse(String message) {

        Map<String, Object> result = new HashMap<>();
        result.put("report", message);
        return result;
    }

    // * *********************** *
    // * * . . . SETTERS . . . * *
    // * *********************** *

    public void setWorkflowService(WorkflowService workflowService) {

        this.workflowService = workflowService;
    }

    public void setNamespaceService(NamespaceService namespaceService) {

        this.namespaceService = namespaceService;
    }

    public void setTransactionService(TransactionService transactionService) {

        this.transactionService = transactionService;
    }

}
