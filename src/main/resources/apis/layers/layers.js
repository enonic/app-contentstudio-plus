/*global resolve*/

const contentLib = require('/lib/xp/content');
const contextLib = require('/lib/xp/context');
const projectLib = require('/lib/xp/project');


exports.get = (req) => {
    const contentId = req.params.contentId;

     if (!contentId) {
          return {
              status: 400,
              contentType: 'text/plain',
              body: 'Missing required parameter: contentId'
          };
     }

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

    const result = new Map();

    availableProjects.forEach((availableProject) => {
        result.set(availableProject.id, availableProject);
    });

    availableProjects.forEach( availableProject => {
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

