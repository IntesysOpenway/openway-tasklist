Openway Tasklist
=======

Description
-----------

Openway Tasklist Addon replaces the My Tasks default page with a custom page adding new features.

Features:
*  new page layout
*  new filters (Workflow Type and Task Type)
*  the filter selection is saved in the user preferences and pre-selected the next time you return in the page
*  opportunity to configure custom columns for every workflow or task type
*  opportunity to select and complete multiple tasks of the same type

The Addon is developed for Alfresco Community Edition 4.2.e or more, Alfresco Community Edition 5.1.g.

Installing
-----------

1.	[Click here](https://github.com/IntesysOpenway/openway-tasklist/releases) to download amp files.
2.	Shutdown alfresco
3.	Follow [these istructions](http://docs.alfresco.com/5.0/tasks/dev-extensions-tutorials-simple-module-install-amp.html) to install amp files
4.	Start alfresco
5.	Deploy the share module to enable the addon. [Click here](http://localhost:8080/share/page/modules/deploy) and add "openway-tasklist-extension"

Build from source
-----------

1.	Clone the repository and checkout specific release tag (4.2.4.x.x for Alfresco 4.2.e , 5.1.6.x.x for Alfresco 5.1.g)
2.	Run `mvn clean install` to build amps, jars and install them to local repository

Include openway-tasklist as dependency of your Alfresco Maven SDK project via maven configuration
-----------

1.	Add the following configuration to the repo-side pom.xml:

		<dependencies>
			<dependency>
				<groupId>it.iopenway</groupId>
				<artifactId>openway-tasklist-alfresco</artifactId>
				<version>${openway-tasklist.version}</version>
				<classifier>jar</classifier>
			</dependency>
		</dependencies>

2.	Add the following configuration to the share-side pom.xml:

		<dependencies>
			<dependency>
				<groupId>it.iopenway</groupId>
				<artifactId>openway-tasklist-share</artifactId>
				<version>${openway-tasklist.version}</version>
				<classifier>jar</classifier>
			</dependency>
		</dependencies>

Configuring
-----------

1.	Create a new alfresco-config file.
2.	Create a new configuration for every workflow definition. In this section you can:
	*	configure custom columns to show for this workflow definition
	*	configure the task types filter

			<config evaluator="string-compare" condition="activiti$activitiAdhoc">
				<properties>
					<property name="bpm_description" width="0" formatter="renderTitleCell" />
					<property name="bpm_startDate" width="100" formatter="renderDateCell" />
					<property name="bpm_status" width="120" formatter="renderTextCell" />
				</properties>
					<task-types>
					<task-type value="wf:adhocTask" label="Task" />
					<task-type value="wf:completedAdhocTask" label="Completed task" />
				</task-types>
			</config>

3. Create a new configuration for every task type. Here you can:
	*	configure custom columns to show for this task type
	*	configure transition options to use in My Tasks page

			<config evaluator="string-compare" condition="wf:adhocTask">
				<properties>
					<property name="bpm_description" width="0" formatter="renderTitleCell" />
					<property name="bpm_startDate" width="100" formatter="renderDateCell" />
					<property name="bpm_status" width="120" formatter="renderTextCell" />
				</properties>
				<transitions>
					<options>Next|Compito eseguito</options>
				</transitions>
			</config>
4.	Deploy the share module to enable the addon. [Click here](http://localhost:8080/share/page/modules/deploy) and add "openway-tasklist-extension"

Use
-----------

1.	[Click here](http://localhost:8080/share/page/iopenway-my-tasks) to open My Tasks page
2.	On the left column you have two new filters: Workflow Type and Task Type. 
3.	Select a Workflow Type (when you do it, Task Type filter will be refreshed)
4.	If you select a Task Type and run filter, on the top of the task table transaction buttons will be visible.
5.	Select tasks you want to complete and click a transaction button. After that you will see a popup reporting if all tasks will have been completed.
6.	The filter selection is saved in the user preferences and pre-selected the next time you return in My Tasks page.

