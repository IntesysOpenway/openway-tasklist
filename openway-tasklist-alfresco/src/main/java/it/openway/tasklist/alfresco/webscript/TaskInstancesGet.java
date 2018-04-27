/*
 * Copyright (C) 2005-2011 Alfresco Software Limited. This file is part of Alfresco Alfresco is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any
 * later version. Alfresco is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details. You should have received a copy of the GNU Lesser General
 * Public License along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.web.scripts.workflow.AbstractWorkflowWebscript;
import org.alfresco.repo.web.scripts.workflow.WorkflowModelBuilder;
import org.alfresco.repo.workflow.WorkflowModel;
import org.alfresco.service.cmr.dictionary.DataTypeDefinition;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.workflow.WorkflowTask;
import org.alfresco.service.cmr.workflow.WorkflowTaskQuery;
import org.alfresco.service.cmr.workflow.WorkflowTaskQuery.OrderBy;
import org.alfresco.service.cmr.workflow.WorkflowTaskState;
import org.alfresco.service.namespace.QName;
import org.alfresco.util.ModelUtil;
import org.apache.http.HttpStatus;
import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptException;
import org.springframework.extensions.webscripts.WebScriptRequest;

public class TaskInstancesGet extends AbstractWorkflowWebscript {

    public static final String PARAM_AUTHORITY = "authority";
    public static final String PARAM_STATE = "state";
    public static final String PARAM_PRIORITY = "priority";
    public static final String PARAM_DUE_BEFORE = "dueBefore";
    public static final String PARAM_DUE_AFTER = "dueAfter";
    public static final String PARAM_PROPERTIES = "properties";
    public static final String PARAM_POOLED_TASKS = "pooledTasks";
    public static final String PARAM_INITIATOR = "initiator";
    public static final String PARAM_TASK_NAME = "taskName";
    public static final String PARAM_WORFKLOW_NAME = "workflowName";
    public static final String VAR_WORKFLOW_INSTANCE_ID = "workflow_instance_id";

    public static final String PARAM_SORT = "sort";
    public static final String PARAM_DIR = "dir";

    @Override
    protected Map<String, Object> buildModel(WorkflowModelBuilder modelBuilder, WebScriptRequest req, Status status, Cache cache) {

        Map<String, String> params = req.getServiceMatch().getTemplateVars();
        Map<String, Object> filters = new HashMap<String, Object>(4);

        // authority is not included into filters list as it will be taken into
        // account before filtering
        String authority = getAuthority(req);

        if (authority == null) {
            // ALF-11036 fix, if authority argument is omitted the tasks for the
            // current user should be returned.
            authority = authenticationService.getCurrentUserName();
        }

        // state is also not included into filters list, for the same reason
        WorkflowTaskState state = getState(req);

        // look for a workflow instance id
        String workflowInstanceId = params.get(VAR_WORKFLOW_INSTANCE_ID);

        // determine if pooledTasks should be included, when appropriate i.e.
        // when an authority is supplied
        Boolean pooledTasksOnly = getPooledTasks(req);

        // get list of properties to include in the response
        List<String> properties = getProperties(req);

        // get filter param values
        filters.put(PARAM_PRIORITY, req.getParameter(PARAM_PRIORITY));
        processDateFilter(req, PARAM_DUE_BEFORE, filters);
        processDateFilter(req, PARAM_DUE_AFTER, filters);

        String param = req.getParameter(PARAM_EXCLUDE);
        if (param != null && param.length() > 0) {
            filters.put(PARAM_EXCLUDE, new ExcludeFilter(param));
        }
        param = req.getParameter(PARAM_TASK_NAME);
        if (param != null && !"*".equals(param) && !param.trim().isEmpty()) {
            filters.put(PARAM_TASK_NAME, param);
        }
        param = req.getParameter(PARAM_WORFKLOW_NAME);
        if (param != null && !"*".equals(param) && !param.trim().isEmpty()) {
            filters.put(PARAM_WORFKLOW_NAME, param);
        }
        param = req.getParameter(PARAM_INITIATOR);
        if (param != null && !"*".equals(param) && !param.trim().isEmpty()) {
            filters.put(PARAM_INITIATOR, param);
        }

        List<WorkflowTask> allTasks;

        if (workflowInstanceId != null) {
            // a workflow instance id was provided so query for tasks
            WorkflowTaskQuery taskQuery = new WorkflowTaskQuery();
            taskQuery.setActive(null);
            taskQuery.setProcessId(workflowInstanceId);
            taskQuery.setTaskState(state);
            taskQuery.setOrderBy(new OrderBy[] {
                OrderBy.TaskDue_Asc
            });

            if (authority != null) {
                taskQuery.setActorId(authority);
            }

            allTasks = workflowService.queryTasks(taskQuery);
        }
        else {
            // default task state to IN_PROGRESS if not supplied
            if (state == null) {
                state = WorkflowTaskState.IN_PROGRESS;
            }

            // no workflow instance id is present so get all tasks
            if (authority != null) {
                List<WorkflowTask> tasks = workflowService.getAssignedTasks(authority, state, true);
                List<WorkflowTask> pooledTasks = workflowService.getPooledTasks(authority, true);
                if (pooledTasksOnly != null) {
                    if (pooledTasksOnly.booleanValue()) {
                        // only return pooled tasks the user can claim
                        allTasks = new ArrayList<WorkflowTask>(pooledTasks.size());
                        allTasks.addAll(pooledTasks);
                    }
                    else {
                        // only return tasks assigned to the user
                        allTasks = new ArrayList<WorkflowTask>(tasks.size());
                        allTasks.addAll(tasks);
                    }
                }
                else {
                    // include both assigned and unassigned tasks
                    allTasks = new ArrayList<WorkflowTask>(tasks.size() + pooledTasks.size());
                    allTasks.addAll(tasks);
                    allTasks.addAll(pooledTasks);
                }

                // sort tasks by due date

                String s = req.getParameter(PARAM_SORT);
                String dir = req.getParameter(PARAM_DIR);

                QName sortProp = WorkflowModel.PROP_DUE_DATE;
                if (s != null) {
                    String[] aString = s.split("_");
                    if (aString.length == 2)
                        sortProp = QName.createQName(namespaceService.getNamespaceURI(aString[0]), aString[1]);
                }
                boolean orderAsc = dir == null || dir.equalsIgnoreCase("asc");

                Comparator<WorkflowTask> taskComparator = null;
                if ("taskType".equals(s)) {
                    taskComparator = new WorkflowTypeComparator(orderAsc);
                }
                else {
                    DataTypeDefinition type = dictionaryService.getProperty(sortProp).getDataType();
                    if (String.class.getName().equals(type.getJavaClassName())) {
                        taskComparator = new WorkflowStringComparator(sortProp, orderAsc);
                    }
                    else if (Date.class.getName().equals(type.getJavaClassName())) {
                        taskComparator = new WorkflowDateComparator(sortProp, orderAsc);
                    }
                    else {
                        taskComparator = new WorkflowNumberComparator(sortProp, orderAsc);
                    }
                }

                Collections.sort(allTasks, taskComparator);
            }
            else {
                // authority was not provided -> return all active tasks in the
                // system
                WorkflowTaskQuery taskQuery = new WorkflowTaskQuery();
                taskQuery.setTaskState(state);
                taskQuery.setActive(null);
                taskQuery.setOrderBy(new OrderBy[] {
                    OrderBy.TaskDue_Asc
                });
                allTasks = workflowService.queryTasks(taskQuery);
            }
        }

        int maxItems = getIntParameter(req, PARAM_MAX_ITEMS, DEFAULT_MAX_ITEMS);
        int skipCount = getIntParameter(req, PARAM_SKIP_COUNT, DEFAULT_SKIP_COUNT);
        int totalCount = 0;
        ArrayList<Map<String, Object>> results = new ArrayList<Map<String, Object>>();

        // Filter results
        WorkflowTask task = null;
        for (int i = 0; i < allTasks.size(); i++) {
            task = allTasks.get(i);
            if (matches(task, filters)) {
                // Total-count needs to be based on matching tasks only, so we
                // can't just use allTasks.size() for this
                totalCount++;
                if (totalCount > skipCount && (maxItems < 0 || maxItems > results.size())) {
                    // Only build the actual detail if it's in the range of
                    // items we need. This will
                    // drastically improve performance over paging after
                    // building the model
                    results.add(modelBuilder.buildSimple(task, properties));
                }
            }
        }

        Map<String, Object> model = new HashMap<String, Object>();
        model.put("taskInstances", results);

        if (maxItems != DEFAULT_MAX_ITEMS || skipCount != DEFAULT_SKIP_COUNT) {
            // maxItems or skipCount parameter was provided so we need to
            // include paging into response
            model.put("paging", ModelUtil.buildPaging(totalCount, maxItems == DEFAULT_MAX_ITEMS ? totalCount : maxItems, skipCount));
        }

        // create and return results, paginated if necessary
        return model;
    }

    /**
     * Retrieves the list of property names to include in the response.
     * 
     * @param req
     *        The WebScript request
     * @return List of property names
     */
    private List<String> getProperties(WebScriptRequest req) {

        String propertiesStr = req.getParameter(PARAM_PROPERTIES);
        if (propertiesStr != null) {
            return Arrays.asList(propertiesStr.split(","));
        }
        return null;
    }

    /**
     * Retrieves the pooledTasks parameter.
     * 
     * @param req
     *        The WebScript request
     * @return null if not present, Boolean object otherwise
     */
    private Boolean getPooledTasks(WebScriptRequest req) {

        Boolean result = null;
        String includePooledTasks = req.getParameter(PARAM_POOLED_TASKS);

        if (includePooledTasks != null) {
            result = Boolean.valueOf(includePooledTasks);
        }

        return result;
    }

    /**
     * Gets the specified {@link WorkflowTaskState}, null if not requested
     * 
     * @param req
     * @return
     */
    private WorkflowTaskState getState(WebScriptRequest req) {

        String stateName = req.getParameter(PARAM_STATE);
        if (stateName != null) {
            try {
                return WorkflowTaskState.valueOf(stateName.toUpperCase());
            }
            catch (IllegalArgumentException e) {
                String msg = "Unrecognised State parameter: " + stateName;
                throw new WebScriptException(HttpStatus.SC_BAD_REQUEST, msg);
            }
        }

        return null;
    }

    /**
     * Returns the specified authority. If no authority is specified then returns the current Fully Authenticated user.
     * 
     * @param req
     * @return
     */
    private String getAuthority(WebScriptRequest req) {

        String authority = req.getParameter(PARAM_AUTHORITY);
        if (authority == null || authority.length() == 0) {
            authority = null;
        }
        return authority;
    }

    /**
     * Determine if the given task should be included in the response.
     * 
     * @param task
     *        The task to check
     * @param filters
     *        The list of filters the task must match to be included
     * @return true if the task matches and should therefore be returned
     */
    private boolean matches(WorkflowTask task, Map<String, Object> filters) {

        // by default we assume that workflow task should be included
        boolean result = true;

        for (String key : filters.keySet()) {
            Object filterValue = filters.get(key);

            // skip null filters (null value means that filter was not
            // specified)
            if (filterValue != null) {
                if (key.equals(PARAM_EXCLUDE)) {
                    ExcludeFilter excludeFilter = (ExcludeFilter) filterValue;
                    String type = task.getDefinition().getMetadata().getName().toPrefixString(this.namespaceService);
                    if (excludeFilter.isMatch(type)) {
                        result = false;
                        break;
                    }
                }
                else if (key.equals(PARAM_DUE_BEFORE)) {
                    Date dueDate = (Date) task.getProperties().get(WorkflowModel.PROP_DUE_DATE);

                    if (!isDateMatchForFilter(dueDate, filterValue, true)) {
                        result = false;
                        break;
                    }
                }
                else if (key.equals(PARAM_DUE_AFTER)) {
                    Date dueDate = (Date) task.getProperties().get(WorkflowModel.PROP_DUE_DATE);

                    if (!isDateMatchForFilter(dueDate, filterValue, false)) {
                        result = false;
                        break;
                    }
                }
                else if (key.equals(PARAM_PRIORITY)) {
                    if (!filterValue.equals(task.getProperties().get(WorkflowModel.PROP_PRIORITY).toString())) {
                        result = false;
                        break;
                    }
                }
                else if (key.equals(PARAM_TASK_NAME)) {
                    if (!filterValue.equals(task.getName())) {
                        result = false;
                        break;
                    }
                }
                else if (key.equals(PARAM_WORFKLOW_NAME)) {
                    if (!filterValue.equals(task.getPath().getInstance().getDefinition().getName())) {
                        result = false;
                        break;
                    }
                }
                else if (key.equals(PARAM_INITIATOR)) {
                    NodeRef initiatorNodeRef = task.getPath().getInstance().getInitiator();
                    if (!filterValue.equals(nodeService.getProperty(initiatorNodeRef, ContentModel.PROP_USERNAME))) {
                        result = false;
                        break;
                    }
                }
            }
        }

        return result;
    }

    private class WorkflowDateComparator implements Comparator<WorkflowTask> {

        private QName property;
        private boolean orderAsc;

        public WorkflowDateComparator(QName property, boolean orderAsc) {

            this.property = property;
            this.orderAsc = orderAsc;
        }

        @Override
        public int compare(WorkflowTask o1, WorkflowTask o2) {

            Date date1 = (Date) o1.getProperties().get(property);
            Date date2 = (Date) o2.getProperties().get(property);

            long time1 = date1 == null ? Long.MAX_VALUE : date1.getTime();
            long time2 = date2 == null ? Long.MAX_VALUE : date2.getTime();

            long result = time1 - time2;
            int ret = (result > 0) ? 1 : (result < 0 ? -1 : 0);
            return orderAsc ? ret : ret * -1;
        }
    }

    private class WorkflowNumberComparator implements Comparator<WorkflowTask> {

        private QName property;
        private boolean orderAsc;

        public WorkflowNumberComparator(QName property, boolean orderAsc) {

            this.property = property;
            this.orderAsc = orderAsc;
        }

        @Override
        public int compare(WorkflowTask o1, WorkflowTask o2) {

            Number n1 = (Number) o1.getProperties().get(property);
            Number n2 = (Number) o2.getProperties().get(property);

            n1 = n1 == null ? Double.MIN_VALUE : n1;
            n2 = n2 == null ? Double.MIN_VALUE : n2;

            double result = n1.doubleValue() - n2.doubleValue();
            int ret = (result > 0) ? 1 : (result < 0 ? -1 : 0);
            return orderAsc ? ret : ret * -1;
        }
    }

    private class WorkflowStringComparator implements Comparator<WorkflowTask> {

        private QName property;
        private boolean orderAsc;

        public WorkflowStringComparator(QName property, boolean orderAsc) {

            this.property = property;
            this.orderAsc = orderAsc;
        }

        @Override
        public int compare(WorkflowTask o1, WorkflowTask o2) {

            String s1 = (String) o1.getProperties().get(property);
            String s2 = (String) o2.getProperties().get(property);

            s1 = s1 == null ? "" : s1;
            s2 = s2 == null ? "" : s2;

            int ret = s1.compareTo(s2);
            return orderAsc ? ret : ret * -1;
        }

    }

    private class WorkflowTypeComparator implements Comparator<WorkflowTask> {

        private boolean orderAsc;

        public WorkflowTypeComparator(boolean orderAsc) {

            this.orderAsc = orderAsc;
        }

        @Override
        public int compare(WorkflowTask o1, WorkflowTask o2) {

            String s1 = o1.getDefinition().getId();
            String s2 = o2.getDefinition().getId();

            s1 = s1 == null ? "" : s1;
            s2 = s2 == null ? "" : s2;

            int ret = s1.compareTo(s2);
            return orderAsc ? ret : ret * -1;
        }

    }
}
