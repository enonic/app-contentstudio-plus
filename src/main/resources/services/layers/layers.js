/*global resolve*/

const contentLib = require('/lib/xp/content');
const contextLib = require('/lib/xp/context');
const projectLib = require('/lib/xp/project');

exports.get = (req) => {
    const missingParams = [];

    if (!req.params.contentId) {
        missingParams.push('contentId');
    }

    if (!req.params.project) {
        missingParams.push('project');
    }

    if (missingParams.length > 0) {
        return {
            status: 400,
            contentType: 'text/plain',
            body: 'Missing required parameter(s): ' + missingParams.join(', ')
        };
    }

    const contentId = req.params.contentId;
    const projectName = req.params.project;

    const availableProjects = projectLib.list();
    const allProjects = contextLib.run(
        {
            principals: ["role:system.admin"],
            branch: 'draft'
        },
        function() {
            return projectLib.list();
        }
    );

    // In case some content from different project tree has the same id we need to filter them out (can happen after import)
    const topLevelProject = calcTopLevelProject(projectName, allProjects);
    const availableProjectsInSameTree = availableProjects.filter(p => isInSameProjectTreeWith(p.id, allProjects, topLevelProject.id));

    const result = new Map();

    availableProjectsInSameTree.forEach((availableProject) => {
        result.set(availableProject.id, availableProject);
    });

    availableProjectsInSameTree.forEach( availableProject => {
        let parentId = availableProject.parent;

        while ( parentId && !result.has( parentId ) )
        {
            const parentProject = allProjects.filter(p => p.id === parentId)[0];

            if ( parentProject )
            {
                result.set( parentId, createReadonlyProject(parentProject) );
                parentId = parentProject.parent;
            }
            else
            {
                parentId = null;
            }
        }
    } );

    const projectsArray = [];

    for (const project of result.values()) {
        if (isAvailableProject(project)) {
            const content = getContent(contentId, project.id);

            projectsArray.push({
                item: content,
                project: project,
                compareAndPublishStatus: content ? getContentCompareStatus(contentId, project.id) : null,
            });
        } else {
            projectsArray.push({
                item: null,
                project: project,
            });
        }
    }


    return {
        status: 200,
        contentType: 'application/json',
        body: {
            projects: projectsArray,
        },
    };
};

const getContent = (contentId, projectId) => {
    return contextLib.run(
        {
            repository: 'com.enonic.cms.' + projectId,
            branch: 'draft'
        },
        () => {
            return contentLib.get({
                key: contentId,
            });
        }
    );
};

const createReadonlyProject = (source) => {
    const result = {
        id: source.id,
    };

    if (source.parent) {
        result.parents = [source.parent];
    }

    return result;
}

const isAvailableProject = (project) => {
    return !!project && project.displayName;
}

const getContentCompareStatus = (contentId, projectId) => {
    return contextLib.run(
        {
            repository: 'com.enonic.cms.' + projectId,
            branch: 'draft'
        },
        () => {
            const bean = __.newBean('com.enonic.xp.app.contentstudio.plus.widgets.layers.CompareStatusHandler');
            bean.contentId = __.nullOrValue(contentId);
            return __.toNativeObject(bean.getCompareStatus());
        }
    );
}

const calcTopLevelProject = (projectName, allProjects) => {
    let currentProject = allProjects.filter(p => p.id === projectName)[0];

    while (currentProject.parent) {
        const parentId = currentProject.parent;
        currentProject = allProjects.filter(p => p.id === parentId)[0];
    }

    return currentProject;
}

const isInSameProjectTreeWith = (projectName, projectsList, topParentName) => {
    const projectsTopParent = calcTopLevelProject(projectName, projectsList);
    return projectsTopParent.id === topParentName;
}
