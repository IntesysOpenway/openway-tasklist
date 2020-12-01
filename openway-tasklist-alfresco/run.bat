@ECHO OFF

SET COMPOSE_FILE_PATH=%CD%\target\classes\docker\docker-compose.yml

IF [%M2_HOME%]==[] (
    SET MVN_EXEC=mvn
)

IF NOT [%M2_HOME%]==[] (
    SET MVN_EXEC=%M2_HOME%\bin\mvn
)

SET BUILD_ARGS=

IF [%1]==[] (
    echo "Usage: %0 {build_start|build_start_it_supported|start|stop|purge|tail|build_test|test}"
    GOTO END
)

IF %1==build_start (
    CALL :down
    CALL :build
    CALL :start
    CALL :tail
    GOTO END
)
IF %1==build_start_it_supported (
    CALL :down
    CALL :build
    CALL :prepare_test
    CALL :start
    CALL :tail
    GOTO END
)
IF %1==start (
    CALL :start
    CALL :tail
    GOTO END
)
IF %1==stop (
    CALL :down
    GOTO END
)
IF %1==purge (
    CALL:down
    CALL:purge
    GOTO END
)
IF %1==tail (
    CALL :tail
    GOTO END
)
IF %1==build_test (
	SET BUILD_ARGS=-Ddocker.acs.image=alfresco/alfresco-content-repository-community-hotswap-agent
    CALL :down
    CALL :build
    CALL :prepare_test
    CALL :start
    CALL :test
    CALL :tail_all
    CALL :down
    GOTO END
)
IF %1==test (
    CALL :test
    GOTO END
)
echo "Usage: %0 {build_start|start|stop|purge|tail|build_test|test}"
:END
EXIT /B %ERRORLEVEL%

:start
    docker volume create openway-tasklist-acs-volume
    docker volume create openway-tasklist-db-volume
    docker volume create openway-tasklist-ass-volume
    docker-compose -f "%COMPOSE_FILE_PATH%" up --build -d
EXIT /B 0
:down
    if exist "%COMPOSE_FILE_PATH%" (
        docker-compose -f "%COMPOSE_FILE_PATH%" down
    )
EXIT /B 0
:build
	call %MVN_EXEC% clean package
EXIT /B 0
:tail
    docker-compose -f "%COMPOSE_FILE_PATH%" logs -f
EXIT /B 0
:tail_all
    docker-compose -f "%COMPOSE_FILE_PATH%" logs --tail="all"
EXIT /B 0
:prepare_test
    call %MVN_EXEC% verify -DskipTests=true %BUILD_ARGS%
EXIT /B 0
:test
    call %MVN_EXEC% verify
EXIT /B 0
:purge
    docker volume rm -f openway-tasklist-acs-volume
    docker volume rm -f openway-tasklist-db-volume
    docker volume rm -f openway-tasklist-ass-volume
EXIT /B 0