/**
 * Created  on 1.12.2017.
 */
module.exports = Object.freeze({
    generateRandomName: function (part) {
        return part + Math.round(Math.random() * 1000000);
    },
    itemMarkedAsReadyMessage(name) {
        return `Item \"${name}\" is marked as ready`;
    },
    itemIsArchived(name) {
        return `Item \"${name}\" is archived`;
    },
    itemIsRestored(name) {
        return `Item \"${name}\" is restored`;
    },

    itemIsDeleted(name) {
        return `Item \"${name}\" is deleted`;
    },
    variantCreated(name) {
        return `A variant for \"${name}\" has been created`;
    },
    itemDuplicated(name) {
        return `Item \"${name}\" is duplicated.`;
    },

    itemSavedNotificationMessage: function (name) {
        return `Item \"${name}\" is saved.`
    },
    itemPublishedNotificationMessage: function (name) {
        return `Item \"${name}\" is published.`
    },
    issueClosedNotificationMessage: function (name) {
        return `Issue \"${name}\" is closed.`
    },
    sortOrderTitle: function (by, order) {
        return `Sorted by \"${by}\" in ${order} order`
    },
    permissionsAppliedNotificationMessage: function (name) {
        return `Permissions for \"${name}\" are applied.`
    },
    projectModifiedMessage: displayName => `Project \"${displayName}\" is modified.`,
    markedAsReadyMessage: function (name) {
        return `Item \"${name}\" is marked as ready`;
    },
    publishRequestClosedMessage: function (name) {
        return `Publish request \"${name}\" is closed`;
    },
    taskClosedMessage: function (name) {
        return `Task \"${name}\" is closed`;
    },
    saveFailedAttempt: function (name) {
        return `Content \[${name}\] could not be updated. A content with that name already exists`;
    },
    requiredValidationMessage: (occurrences) => {
        return `Min ${occurrences} valid occurrence(s) required`;
    },
    projectCreatedMessage: name => `Project \"${name}\" is created.`,
    projectNameAlreadyExistsMessage: name => `Project with name [${name}] already exists`,
    projectDeletedMessage: name => `Project \"${name}\" is deleted.`,
    NO_CHANGES_TO_REVERT_MESSAGE: "No changes to revert.",
    THIS_PUBLISH_REQUEST_OPEN: 'The publish request is Open.',
    REQUEST_CREATED_MESSAGE: 'New publish request created successfully.',
    TASK_CLOSED_MESSAGE: 'The task is Closed.',
    TASK_CREATED_MESSAGE: "New task created successfully.",
    PUBLISH_REQUEST_CLOSED_MESSAGE: 'The publish request is Closed.',
    TASK_OPENED_MESSAGE: 'The task is Open.',
    TWO_ITEMS_PUBLISHED: "2 items are published.",
    TWO_ITEMS_UNPUBLISHED: "2 items are unpublished",
    ITEM_IS_UNDELETED_MESSAGE: "Item is undeleted",
    CONTENT_RENAMED: "Content has been renamed",
    TEST_FOLDER_WITH_IMAGES: "All Content types images",
    TEST_FOLDER_WITH_IMAGES_NAME: "all-content-types-images",
    TEST_FOLDER_WITH_IMAGES_2: "Images for simple page",
    TEST_FOLDER_WITH_IMAGES_NAME_2: "imagearchive",
    TEST_FOLDER_2_DISPLAY_NAME: "folder for selenium tests",
    TEST_FOLDER_2_NAME: "selenium-tests-folder",
    TEST_FOLDER_NAME: 'all-content-types-images',
    APP_CONTENT_TYPES: 'All Content Types App',
    SIMPLE_SITE_APP: 'Simple Site App',
    MY_FIRST_APP: "My First App",
    APP_WITH_CONFIGURATOR: 'Second Selenium App',
    APP_WITH_METADATA_MIXIN: 'Third Selenium App',
    THIS_FIELD_IS_REQUIRED: 'This field is required',
    YOUR_COMMENT_ADDED: 'Your comment is added to the task.',
    LOCALIZED_MESSAGE_1: "Language was copied from current project.",
    LOCALIZED_MESSAGE_2: "Inherited content was localized",
    CONTENT_REVERTED_MESSAGE: 'The content was reverted to the version from',
    PROJECT_UNSAVED_CHANGES_MESSAGE: "There are unsaved changes, do you want to save them before closing?",
    NOTIFICATION_MSG: {
        CONTENT_LOCALIZED: 'Inherited content is localized',
    },
    ACCESS_WIDGET_HEADER: {
        RESTRICTED_ACCESS: "Restricted access to item",
        EVERYONE_CAN_READ: "Everyone can read this item"
    },
    PROJECT_SYNC: {
        STARTED: "Content synchronisation job has started",
        FINISHED: "Content synchronisation job has finished"
    },
    PASSWORD: {
        MEDIUM: "password123",
        STRONG: "password123=",
        WEAK: "password"
    },
    VERSIONS_ITEM_HEADER: {
        PERMISSIONS_UPDATED: 'Permissions updated',
        CREATED: "Created",
        EDITED: "Edited",
        MARKED_AS_READY: "Marked as Ready",
        SORTED: "Sorted",
        PUBLISHED: "Published",
        CHANGED: "Changed",
        ARCHIVED: "Archived"
    },

    VALIDATION_MESSAGE: {
        TEXT_IS_TOO_LONG: "Text is too long",
        INVALID_VALUE_ENTERED: "Invalid value entered",
        SCHEDULE_FORM_ONLINE_PAST: "Online to cannot be in the past",
        SCHEDULE_FORM_ONLINE_FROM_EMPTY: "Online to cannot be set without Online from",
        THIS_FIELD_IS_REQUIRED: 'This field is required',
        SINGLE_SELECTION_OPTION_SET: "At least one option must be selected",
    },

    PROJECT_ACCESS_MODE: {
        PRIVATE: "Private",
        PUBLIC: "Public",
        CUSTOM: "Custom"
    },
    //waitForTimeout
    mediumTimeout: 4000,
    TIMEOUT_4: 4000,
    TIMEOUT_5: 5000,
    longTimeout: 10000,
    saveProjectTimeout: 15000,
    shortTimeout: 2000,
    TIMEOUT_1: 1000,
    SUITE_TIMEOUT: 180000,
    DELETE_INBOUND_MESSAGE: 'One or more items are referenced from another content',

    IMAGE_STYLE_ORIGINAL: "Original (no image processing)",
    WIDGET_TITLE: {
        VERSION_HISTORY: 'Version history',
        DEPENDENCIES: 'Dependencies',
        LAYERS: 'Layers',
        EMULATOR: 'Emulator',
        VARIANTS: 'Variants',
        PUBLISHING_REPORT: 'Publishing report',
        DETAILS: 'Details'
    },
    EMULATOR_RESOLUTION: {
        MEDIUM_PHONE: 'Medium Phone',
        LARGE_PHONE: 'Large Phone',
        TABLET: 'Tablet',
        NOTEBOOK_13: "13\" Notebook",
        SMALL_PHONE: 'Small Phone',
        NOTEBOOK_15: "15\" Notebook",
    },
    EMULATOR_RESOLUTION_VALUE: {
        FULL_SIZE: '100%',
        MEDIUM_PHONE: '375px',
        LARGE_PHONE: '414px',
        TABLET: '768px',
        NOTEBOOK_13: '1280px',
        SMALL_PHONE: '320px',
        NOTEBOOK_15: '1356px',
    },
    ACCESS_MENU_ITEM: {
        CUSTOM: 'Custom...',
        CAN_PUBLISH: 'Can Publish',
        FULL_ACCESS: 'Full Access'
    },
    TEMPLATE_SUPPORT: {
        SITE: 'Site',
    },
    SORTING_ORDER: {
        MODIFIED_DATE: 'Modified date',
        CREATED_DATE: 'Created date',
    },
    TEST_IMAGES: {
        HAND: 'hand',
        WHALE: 'whale',
        RENAULT: 'renault',
        SPUMANS: 'spumans',
        BOOK: 'book',
        POP_03: 'Pop_03',
        POP_02: 'Pop_02',
        KOTEY: 'kotey',
        SHIP: 'cat',
        FOSS: 'foss',
        SENG: 'seng',
        PES: 'morgopes',
        NORD: 'nord',
        CAPE: 'cape',
        BRO: 'bro',
        MAN2: 'man2',
        SEVEROMOR: 'severomor',
        ELEPHANT: 'elephant',
        ENTERPRISE: 'enterprise',
        GEEK: 'geek',
        TELK: "telk"
    },
    COMPONENT_VIEW_MENU_ITEMS: {
        INSERT: 'Insert',
        SAVE_AS_FRAGMENT: 'Save as Fragment',
        SAVE_AS_TEMPLATE: "Save as Template",
        DETACH_FROM_FRAGMENT: 'Detach from fragment',
        INSPECT: 'Inspect',
        REMOVE: 'Remove',
        DUPLICATE: 'Duplicate',
        EDIT: 'Edit',
        SELECT_PARENT: "Select parent",
        RESET: 'Reset'
    },
    PROJECTS: {
        ROOT_FOLDER: "Projects",
        ROOT_FOLDER_DESCRIPTION: "Manage projects and layers",
        DEFAULT_PROJECT_NAME: "Default"
    },
    PROJECT_ROLES: {
        CONTRIBUTOR: "Contributor",
        AUTHOR: "Author",
        EDITOR: "Editor",
        OWNER: "Owner",
        VIEWER: "Viewer"
    },
    SHOW_ISSUES_BUTTON_LABEL: {
        NO_OPEN_ISSUES: 'No open issues',
        OPEN_ISSUES: 'Open Issues'
    },

    LANGUAGES: {
        EN: 'English (en)',
        NORSK_NORGE: 'norsk (Norge) (no-NO)',
        NORSK_NO: 'norsk (no)'
    },
    RADIO_OPTION: {
        OPTION_A: "option A",
        OPTION_B: "option B",
        OPTION_C: "option C",
    },
    contentTypes: {
        SHORTCUT: 'Shortcut',
        FOLDER: `Folder`,
        SITE: 'Site',
        PAGE_TEMPLATE: `Page Template`,
        HTML_AREA_0_1: `htmlarea0_1`,
        HTML_AREA_2_4: `htmlarea2_4`,
        IMG_SELECTOR_0_0: 'imageselector0_0',
        IMG_SELECTOR_0_1: 'imageselector0_1',
        IMG_SELECTOR_1_1: 'imageselector1_1',
        IMG_SELECTOR_2_4: 'imageselector2_4',
        ARTICLE: `article`,
        CUSTOM_RELATIONSHIP: 'custom-relationship2_4',
        DOUBLE_MIN_MAX: 'double_max',
        DOUBLE_DEFAULT_2_4: 'double2_4_def',
        DOUBLE_0_1: "double0_1",
        DOUBLE_1_1: "double1_1",
        DOUBLE_2_4: "double2_4",
        LONG_MIN_MAX: 'long_max',
        TEXTAREA_MAX_LENGTH: 'textarea_conf',
        TEXTLINE_MAX_LENGTH: 'textline_conf',
        TEXTLINE_REGEXP: 'text_line_regexp',
        TEXTLINE_0_1: 'textline0_1',
        TEXTLINE_1_0: 'textline1_0',
        TEXTLINE_1_1: 'textline1_1',
        GEOPOINT_0_0: 'geopoint0_0',
        GEOPOINT_1_1: 'geopoint1_1',
        TIME_0_1: "time0_1",
        DATE_TIME_NOW_CONFIG: 'datetime now',
        DATE_TIME_1_1: 'datetime1_1',
        DATE_1_1: 'date1_1',
        ATTACHMENTS_1_1: 'attachment1_1',
        ATTACHMENTS_0_0: 'attachment0_0',
        LONG_0_1: "long0_1",
        LONG_1_1: "long1_1",
        LONG_2_4: "long2_4",
        TEXT_AREA_1_1: "textarea1_1",
        TEXT_AREA_0_1: "textarea0_1",
        TEXT_AREA_2_4: "textarea2_4",
        CHECKBOX_0_1: "checkbox",
        FIELDSET: "fieldset",
        COMBOBOX_0_0: "combobox0_0",
        COMBOBOX_1_1: "combobox1_1",
        COMBOBOX_2_4: "combobox2_4",
        RADIOBUTTON_1_1: "radiobutton1_1",
        RADIOBUTTON_0_1: "radiobutton0_1",
        TAG_2_5: "tag2_5",
        TAG_0_5: "tag0_5",
        CUSTOM_SELECTOR_0_2: 'custom-selector0_2',
        CUSTOM_SELECTOR_1_1: 'custom-selector1_1',
        OPTION_SET: 'optionset',
        ITEM_SET_0_0: 'item-set0_0'
    },
    permissions: {
        FULL_ACCESS: `Full Access`,
        CUSTOM: `Custom...`,
        CAN_PUBLISH: `Can Publish`,
        CAN_READ: `Can Read`,
    },
    permissionOperation: {
        READ: 'Read',
        CREATE: `Create`,
        MODIFY: 'Modify',
        DELETE: `Delete`,
        PUBLISH: `Publish`,
        READ_PERMISSIONS: `Read Permissions`,
        WRITE_PERMISSIONS: 'Write Permissions',
    },
    roleName: {
        CONTENT_MANAGER_APP: 'cms.cm.app',
    },
    roleDisplayName: {
        CONTENT_MANAGER_APP: 'Content Manager App',
    },
    systemUsersDisplayName: {
        ANONYMOUS_USER: 'Anonymous User',
        EVERYONE: 'Everyone',
        SUPER_USER: 'Super User',
    },
    sortMenuItem: {
        DISPLAY_NAME: 'Display name',
        MANUALLY_SORTED: 'Manually sorted',
        MODIFIED_DATE: "Modified date",
        CREATED_DATE: "Created date",
        PUBLISHED_DATE: "Published date",
    },
    CONTENT_STATUS: {
        NEW: 'New',
        PUBLISHED: 'Published',
        UNPUBLISHED: 'Unpublished',
        MODIFIED: 'Modified',
        MARKED_FOR_DELETION: 'Marked for deletion',
        MOVED: 'Moved',
        PUBLISHING_SCHEDULED: 'Publishing Scheduled'
    },
    PUBLISH_MENU: {
        REQUEST_PUBLISH: "Request Publishing...",
        PUBLISH: "Publish...",
        PUBLISH_TREE: "Publish Tree...",
        MARK_AS_READY: "Mark as ready",
        UNPUBLISH: "Unpublish...",
        CREATE_ISSUE: "Create Issue..."
    },
    GRID_CONTEXT_MENU: {
        ARCHIVE: "Archive...",
        RESTORE: "Restore...",
        DELETE: "Delete...",
        EDIT: "Edit",
        PREVIEW: "Preview",
        DUPLICATE: "Duplicate...",
        PUBLISH: "Publish...",
        MOVE: "Move...",
        SORT: "Sort..."
    },
    WORKFLOW_STATE: {
        WORK_IN_PROGRESS: 'Work in progress',
        READY_FOR_PUBLISHING: 'Ready for publishing',
        PUBLISHED: 'Published'
    },
    ISSUE_LIST_TYPE_FILTER: {
        ALL: 'All',
        ASSIGNED_TO_ME: 'Assigned to Me',
        CREATED_BY_ME: 'Created by Me',
        PUBLISH_REQUESTS: 'Publish requests',
        TASKS: 'Tasks'
    },
    SYSTEM_ROLES: {
        CM_ADMIN: 'Content Manager Administrator',
        ADMIN_CONSOLE: 'Administration Console Login',
        CM_APP: 'Content Manager App',
        CM_APP_EXPERT: 'Content Manager Expert',
        ADMINISTRATOR: 'Administrator',
        USERS_APP: 'Users App',
        AUTHENTICATED: 'Authenticated',
        USERS_ADMINISTRATOR: 'Users Administrator',
        EVERYONE: 'Everyone'
    },
    FILTER_PANEL_AGGREGATION_BLOCK: {
        CONTENT_TYPES: 'Content Types',
        WORKFLOW: 'Workflow',
        LAST_MODIFIED: 'Last Modified',
        LAST_MODIFIED_BY: 'Last Modified by',
        OWNER: 'Owner',
        LANGUAGE: 'Language',
        ARCHIVED: 'Archived',
        ARCHIVED_BY: 'Archived By',
    },
    WIDGET_SELECTOR_OPTIONS: {
        VERSION_HISTORY: 'Version history',
        DEPENDENCIES: 'Dependencies',
        LAYERS: 'Layers',
        EMULATOR: 'Emulator',
        DETAILS: 'Details'
    },
    BROWSER_TITLES: {
        CONTENT_STUDIO: 'Content Studio - Enonic XP Admin',
        XP_HOME: 'Enonic XP Home',
    },
    ACCESSIBILITY_ATTRIBUTES: {
        ROLE: 'role',
        ARIA_LABEL: 'aria-label',
        ARIA_HAS_POPUP: 'aria-haspopup',
    },
    PREVIEW_WIDGET: {
        AUTOMATIC: 'Automatic',
        ENONIC_RENDERING: 'Enonic rendering',
        MEDIA: 'Media',
        JSON: 'JSON'
    },
    PREVIEW_JSON_KEY: {
        NAME: '_name',
        DISPLAY_NAME: 'displayName',
        PATH: '_path',
        CREATOR: 'creator',
        MODIFIER: 'modifier',
    },
});
