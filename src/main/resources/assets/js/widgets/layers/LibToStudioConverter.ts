import {Content as XPContent} from '@enonic-types/lib-content';
import {Project as XPProject, ProjectPermission, SiteConfig} from '@enonic-types/lib-project';
import {ApplicationConfig} from '@enonic/lib-admin-ui/application/ApplicationConfig';
import {ContentTypeName} from '@enonic/lib-admin-ui/schema/content/ContentTypeName';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {ContentName} from 'lib-contentstudio/app/content/ContentName';
import {ContentPath} from 'lib-contentstudio/app/content/ContentPath';
import {ContentSummary, ContentSummaryBuilder} from 'lib-contentstudio/app/content/ContentSummary';
import {ContentUnnamed} from 'lib-contentstudio/app/content/ContentUnnamed';
import {Project} from 'lib-contentstudio/app/settings/data/project/Project';
import {ProjectItemPermissionsBuilder, ProjectPermissions} from 'lib-contentstudio/app/settings/data/project/ProjectPermissions';
import {ProjectReadAccess} from 'lib-contentstudio/app/settings/data/project/ProjectReadAccess';
import {ProjectReadAccessType} from 'lib-contentstudio/app/settings/data/project/ProjectReadAccessType';

export class LibToStudioConverter {

    static convertXPContentToContentSummary(item: XPContent): ContentSummary {
        const contentSummaryBuilder = new ContentSummaryBuilder()
            .setId(item._id)
            .setName(item._name.indexOf(ContentUnnamed.UNNAMED_PREFIX) === 0 ? new ContentUnnamed(item._name): new ContentName(item._name))
            .setPath(ContentPath.create().fromString(item._path).build())
            .setDisplayName(item.displayName)
            .setType(new ContentTypeName(item.type))
            .setHasChildren(item.hasChildren)
            .setCreator(item.creator ? PrincipalKey.fromString(item.creator) : null)
            .setModifier(item.modifier ? PrincipalKey.fromString(item.modifier) : null)
            .setValid(item.valid)
            .setPublishFirstTime(item.publish && item.publish.first ? new Date(Date.parse(item.publish.first)) : null)
            .setPublishFromTime(item.publish && item.publish.from ? new Date(Date.parse(item.publish.from)) : null)
            .setPublishToTime(item.publish && item.publish.to ? new Date(Date.parse(item.publish.to)) : null);

        //contentSummaryBuilder.childOrder = ChildOrder.fromJson(item.childOrder);
        contentSummaryBuilder.language = item.language;
        contentSummaryBuilder.createdTime = item.createdTime ? new Date(item.createdTime) : null;
        contentSummaryBuilder.modifiedTime = item.modifiedTime ? new Date(item.modifiedTime) : null;

        return contentSummaryBuilder.build();
    }

    static convertXPProjectToProject(source: XPProject): Project {
        const projectBuilder = Project.create();
        projectBuilder.setName(source.id);
        projectBuilder.setDisplayName(source.displayName);
        projectBuilder.setDescription(source.description);
        projectBuilder.setParents(source.parents);
        projectBuilder.setLanguage(source.language);
        projectBuilder.setPermissions(LibToStudioConverter.convertXPPermissionsToPermissions(source.permissions));
        projectBuilder.setReadAccess(LibToStudioConverter.convertXPReadAccessToReadAccess(source.readAccess));
        // projectBuilder.setSiteConfigs(LibToStudioConverter.convertXPSiteConfigsToSiteConfigs(source.siteConfig));

        return projectBuilder.build();
    }

    static convertXPPermissionsToPermissions(source: ProjectPermission): ProjectPermissions {
        const builder = new ProjectItemPermissionsBuilder();
        builder.setAuthors(source?.author?.map(PrincipalKey.fromString) || []);
        builder.setEditors(source?.editor?.map(PrincipalKey.fromString) || []);
        builder.setOwners(source?.owner?.map(PrincipalKey.fromString) || []);
        builder.setContributors(source?.contributor?.map(PrincipalKey.fromString) || []);

        return builder.build();
    }

    static convertXPReadAccessToReadAccess(readAccess: ProjectPermission): ProjectReadAccess {
       // TODO: Handle other read access types, types from XP and CS are not mapping well
        return new ProjectReadAccess(ProjectReadAccessType.PUBLIC);
    }

}
