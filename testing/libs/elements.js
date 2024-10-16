/**
 * Created on 02.12.2017.
 */

module.exports = Object.freeze({
    NOTIFICATION_TEXT: "//div[@class='notification-text']",
    FORM_VIEW: `//div[contains(@id,'FormView')]`,
    FORM_ITEM: "//div[contains(@id,'FormItem')]",
    DATE_TIME_PICKER_INPUT: "//div[contains(@id,'DateTimePicker')]//input[contains(@id,'TextInput')]",
    TIME_PICKER_INPUT: "//div[contains(@id,'TimePicker')]//input[contains(@id,'TextInput')]",
    DATE_PICKER_INPUT: "//div[contains(@id,'DatePicker') and @class='date-picker']//input[contains(@id,'TextInput')]",
    CONTENT_SELECTOR: "//div[contains(@id,'ContentSelector')]",
    SELECTED_LOCALE: `//div[contains(@id,'LocaleSelectedOptionView')]`,
    NAMES_VIEW_BY_NAME: "//div[contains(@id,'NamesView') and child::p[contains(@class,'sub-name') and contains(.,'%s')]]",
    NAMES_VIEW_BY_DISPLAY_NAME: "//div[contains(@id,'NamesView') and child::h6[contains(@class,'main-name') and contains(.,'%s')]]",
    SLICK_VIEW_PORT: `//div[contains(@class,'slick-viewport')]`,
    SLICK_ROW: "//div[contains(@class,'slick-viewport')]//div[contains(@class,'slick-row')]",
    H6_DISPLAY_NAME: "//div[contains(@id,'NamesView')]//h6[contains(@class,'main-name')]",
    P_SUB_NAME: "//p[contains(@class,'sub-name')]",
    RICH_TEXT_EDITOR: `//div[contains(@id,'TextComponentView') and contains(@class,'editor-focused')]//div[contains(@id,'TextComponentView')]`,
    TEXT_AREA: "//textarea[contains(@id,'TextArea')]",
    DROP_DOWN_HANDLE: "//button[contains(@id,'DropdownHandle')]",
    GRID_CANVAS: `//div[contains(@class,'grid-canvas')]`,
    SELECTION_PANEL_TOGGLER: `//button[contains(@id,'SelectionPanelToggler')]`,
    TEXT_INPUT: "//input[@type='text']",
    DROPDOWN_OPTION_FILTER_INPUT: "//input[contains(@id,'DropdownOptionFilterInput')]",
    VALIDATION_RECORDING_VIEWER: "//div[contains(@id,'ValidationRecordingViewer')]//li",
    CONTENT_SUMMARY_AND_STATUS_VIEWER: "//div[contains(@id,'ContentSummaryAndCompareStatusViewer')]",
    OPTION_SET_MENU_BUTTON: "//button[contains(@id,'MoreButton')]",
    validationRecording: "//div[contains(@id,'ValidationRecordingViewer')]//li",
    inputView: "//div[contains(@id,'InputView')]",
    INPUT_VALIDATION_VIEW: "//div[contains(@id,'InputViewValidationViewer')]",
    OCCURRENCE_ERROR_BLOCK: "//div[contains(@id,'InputOccurrenceView')]//div[contains(@class,'error-block')]",
    NUMBER_IN_SELECTION_TOGGLER: `//button[contains(@id,'SelectionPanelToggler')]/span`,
    checkBoxDiv: label => `//div[contains(@id,'Checkbox') and child::label[contains(.,'${label}')]]`,
    radioButtonByLabel: label => {
        return `//span[contains(@class,'radio-button') and child::label[text()='${label}']]//input`
    },
    tabBarItemByName(name) {
        return `//li[contains(@id,'TabBarItem') and child::a[text()='${name}']] `
    },
    slickRowByDisplayName: (container, displayName) => {
        return container +
               `//div[contains(@class,'slick-viewport')]//div[contains(@class,'slick-row') and descendant::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]`;
    },
    actionButton: (label) => `//button[contains(@id,'ActionButton') and child::span[contains(.,'${label}')]]`,
    actionButtonStrict: (label) => `//button[contains(@id,'ActionButton') and child::span[text()='${label}']]`,
    dialogButton: label => `//button[contains(@id,'DialogButton') and child::span[text()='${label}']]`,
    slickRowByName: (container, displayName) => {
        return container +
               `//div[contains(@class,'slick-viewport')]//div[contains(@class,'slick-row') and descendant::p[contains(@class,'sub-name') and contains(.,'${displayName}')]]`;
    },
    itemByDisplayName: displayName => {
        return `//div[contains(@id,'NamesView') and child::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]`
    },
    itemStrictByDisplayName: displayName => {
        return `//div[contains(@id,'NamesView') and child::h6[contains(@class,'main-name') and text()='${displayName}']]`
    },
    itemByName: name => {
        return `//div[contains(@id,'NamesView') and child::p[contains(@class,'xp-admin-common-sub-name') and contains(.,'${name}')]]`
    },
    projectByName: name => {
        return `//div[contains(@id,'NamesView') and descendant::span[contains(@class,'name') and contains(.,'${name}')]]`
    },
    formItemByLabel: (label) => {
        return `//div[contains(@id,'FormItem') and descendant::label[contains(.,'${label}')]]`
    },
    expanderIconByName: name => {
        return `//div[contains(@id,'NamesView') and child::p[contains(@class,'xp-admin-common-sub-name') and contains(.,'${name}')]]` +
               `/ancestor::div[contains(@class,'slick-cell')]/span[contains(@class,'collapse') or contains(@class,'expand')]`;
    },
    EMPTY_OPTIONS_DIV: "//div[contains(@class,'empty-options') and text()='No matching items']",
    tabMenuItem: menuName => `//li[contains(@id,'TabMenuItem') and child::a[text()='${menuName}']]`,
    TREE_GRID_CONTEXT_MENU: "//ul[contains(@id,'TreeGridContextMenu')]",
    CANCEL_BUTTON_TOP: `//div[@class='cancel-button-top']`,
    CANCEL_BUTTON_DIALOG: `//button[contains(@id,'DialogButton') and child::span[text()='Cancel']]`,
    COMBO_BOX_OPTION_FILTER_INPUT: "//input[contains(@id,'ComboBoxOptionFilterInput')]",
    CONTENT_WIZARD_STEP_FORM: "//div[contains(@id,'ContentWizardStepForm')]",
    BASE_SELECTED_OPTION: "//div[contains(@id,'BaseSelectedOptionView')]",
    PRINCIPAL_SELECTED_OPTIONS: `//div[contains(@id,'PrincipalSelectedOptionsView')]`,
    PRINCIPAL_SELECTED_OPTION: `//div[contains(@id,'PrincipalSelectedOptionView')]`,
    PRINCIPAL_COMBOBOX: "//div[contains(@id,'PrincipalComboBox')]",
    REMOVE_ICON: "//a[@class='remove']",
    REMOVE_BUTTON: "//a[@class='remove-button']",
    REMOVE_BUTTON_2: "//button[contains(@class,'remove-button')]",
    INCLUDE_CHILDREN_TOGGLER: "//div[contains(@id,'IncludeChildrenToggler')]",
    VERSION_HISTORY_MENU_OPTION: `//div[text()='Version history']`,
    DEPENDENCIES_MENU_OPTION: `//div[text()='Dependencies']`,
    DETAILS_MENU_OPTION: `//div[text()='Details']`,
    CHECKBOX_INPUT: "//input[@type='checkbox']",
    CONTENT_SELECTED_OPTION_VIEW: "//div[contains(@id,'ContentSelectedOptionView')]",
    DETAILS_PANEL_TOGGLE_BUTTON: `//button[contains(@id,'NonMobileContextPanelToggleButton')]`,
    ACTION_BUTTON: `//button[contains(@id,'ActionButton')]`,
    ADD_BUTTON: "//div[contains(@class,'bottom-button-row')]//button[child::span[text()='Add']]",
    SHOW_DEPENDENT_ITEM_LINK: `//h6[@class='dependants-header' and contains(.,'Show dependent items')]`,
    COMPARE_WITH_CURRENT_VERSION: `//button[contains(@id,'ActionButton') and @title='Compare with current version']`,
    LIVE_EDIT_FRAME: "//iframe[contains(@class,'live-edit-frame shown')]",
    APP_MODE_SWITCHER_TOGGLER: "//div[contains(@id,'AppWrapper')]//button[contains(@id,'ToggleIcon')]",
    SETTINGS_BUTTON: "//button[contains(@id,WidgetButton) and @title='Settings']",
    ARCHIVE_BUTTON: "//button[contains(@id,WidgetButton) and @title='Archive']",
    MODE_CONTENT_BUTTON: "//button[contains(@id,WidgetButton) and @title='Content']",
    SHOW_ENTIRE_CONTENT_CHECKBOX_DIV: "//div[contains(@id,'Checkbox') and child::label[text()='Show entire content']]",
    DATE_PICKER:{
        fromDateInput:"//div[contains(@id,'DatePicker') and preceding-sibling::label[text()='From']]//input[contains(@id,'TextInput')]",
        toDateInput: "//div[contains(@id,'DatePicker') and preceding-sibling::label[text()='To']]//input[contains(@id,'TextInput')]",
    },
    CKE: {
        insertTableButton: `//a[contains(@class,'cke_button') and contains(@title,'Table')]`,
        insertLinkButton: `//a[contains(@class,'cke_button') and contains(@title,'Link')]`,
        insertAnchorButton: `//a[contains(@class,'cke_button') and @title='Anchor']`,
        insertImageButton: `//a[contains(@class,'cke_button') and contains(@title,'Image')]`,
        insertMacroButton: `//a[contains(@class,'cke_button') and @title='Insert macro']`,
        insertSpecialCharacter: "//a[contains(@class,'cke_button') and @title='Insert Special Character']",
        italicButton: `//a[contains(@class,'cke_button') and contains(@title,'Italic')]`,
        boldButton: `//a[contains(@class,'cke_button') and contains(@title,'Bold')]`,
        underlineButton: `//a[contains(@class,'cke_button') and contains(@title,'Underline')]`,
        subscriptButton: `//a[contains(@class,'cke_button') and contains(@title,'Subscript')]`,
        superScriptButton: `//a[contains(@class,'cke_button') and contains(@title,'Superscript')]`,
        wrapCodeButton: `//a[contains(@class,'cke_button') and contains(@title,'Wrap code')]`,
        blockQuoteButton: `//a[contains(@class,'cke_button') and contains(@title,'Block Quote')]`,
        alignLeftButton: `//a[contains(@class,'cke_button') and contains(@title,'Align Left')]`,
        alignRightButton: `//a[contains(@class,'cke_button') and contains(@title,'Align Right')]`,
        centerButton: `//a[contains(@class,'cke_button') and contains(@title,'Center')]`,
        justifyButton: `//a[contains(@class,'cke_button') and contains(@title,'Justify')]`,
        bulletedButton: `//a[contains(@class,'cke_button') and contains(@title,'Bulleted List')]`,
        numberedButton: `//a[contains(@class,'cke_button') and contains(@title,'Numbered List')]`,
        sourceButton: `//a[contains(@class,'cke_button__sourcedialog') and contains(@href,'Source')]`,
        fullScreen: `//a[contains(@class,'cke_button__fullscreen')  and contains(@href,'Fullscreen')]`,
        tableButton: `//a[contains(@class,'cke_button') and contains(@title,'Table')]`,
        strikethroughButton: `//a[contains(@class,'cke_button') and contains(@title,'Strikethrough')]`,
        increaseIndentButton: `//a[contains(@class,'cke_button') and contains(@title,'Increase Indent')]`,
        decreaseIndentButton: `//a[contains(@class,'cke_button') and contains(@title,'Decrease Indent')]`,
        formatDropDownHandle: `//span[contains(@class,'cke_combo__styles') and descendant::a[@class='cke_combo_button']]`,
    },
    FILTER_PANEL: {
        clearFilterLink: "//a[contains(@id,'ClearFilterButton')]",
        searchInput: "//input[contains(@id,'TextSearchField')]",
        hideSearchPanelButton: "//span[contains(@class, 'hide-filter-panel-button')]",
        dependenciesSection: "//div[contains(@id,'DependenciesSection')]",
        showResultsButton: "//span[contains(@class,'show-filter-results')]",
        showMoreButton: "//button[child::span[text()='Show more']]",
        showLessButton: "//button[child::span[text()='Show less']]",
        selectorOptionCheckbox: "//ul[contains(@id,'BucketListBox')]//div[contains(@id,'Checkbox')]",
        selectorOptionItem: "//ul[contains(@id,'BucketListBox')]//div[contains(@class,'item-view-wrapper')]",
        ownerAggregationGroupView: "//div[contains(@id,'FilterableAggregationGroupView') and child::h2[text()='Owner']]",
        aggregationGroupDiv: name => `//div[contains(@id,'AggregationGroupView') and child::h2[text()='${name}']]`,
        aggregationDropdown: label => `//div[contains(@id,'FilterableAggregationGroupView') and child::h2[text()='${label}']]//div[contains(@id,'SelectableListBoxDropdown')]`,
    },
    DEPENDANTS: {
        EDIT_ENTRY: "//div[contains(@id,'DialogStateEntry') and contains(@class,'edit-entry')]",
        DEPENDANTS_BLOCK: "//div[contains(@class, 'dependants') and descendant::span[contains(@class,'dependants-title') and text()='Dependencies']]",
        DEPENDENT_ITEM_LIST_UL: "//ul[contains(@id,'DialogDependantItemsList')]",
        DEPENDENT_ITEM_LIST_UL_2: "//ul[contains(@id,'PublishDialogDependantList')]",
        DEPENDANT_ITEM_VIEWER: "//div[contains(@id,'DependantItemViewer')]",
    },
    BUTTONS: {
        PUBLISH_REPORT_GENERATE:"//button[contains(@class,'widget-publish-report-button')]",
        BUTTON_WITH_SPAN_ADD: "//button[child::span[text()='Add']]",
        NEW_CONTENT_BUTTON: "//button[contains(@class,'new-content-button')]",
        REFRESH_BUTTON: "//button[contains(@class,'icon-loop')]",
        DROP_DOWN_HANDLE: "//button[contains(@id,'DropdownHandle')]",
        SELECTION_PANEL_TOGGLER: `//button[contains(@id,'SelectionPanelToggler')]`,
        OPTION_SET_MENU_BUTTON: "//button[contains(@id,'MoreButton')]",
        SELECTOR_MODE_TOGGLER: "//button[contains(@id,'ModeTogglerButton')]",
        UPLOAD_BUTTON: "//button[contains(@class,'upload-button')]",
        actionButton: (label) => `//button[contains(@id,'ActionButton') and child::span[contains(.,'${label}')]]`,
        button: (label, cssValue) => `//button[contains(@class,'${cssValue}') and child::span[contains(.,'${label}')]]`,
        dialogButton: label => `//button[contains(@id,'DialogButton') and child::span[contains(.,'${label}')]]`,
        dialogButtonStrict: label => `//button[contains(@id,'DialogButton') and child::span[text()='${label}']]`,
        togglerButton: (label) => `//button[contains(@id,'TogglerButton') and child::span[text()='${label}']]`,
        MORE_BUTTON: "//button[contains(@id,'MoreButton')]",
    },
    TREE_GRID: {
        CONTENT_STATUS: "//div[contains(@id,'StatusBlock')]/span",
        SORT_DIALOG_TOGGLE: "//div[contains(@class,'sort-dialog-trigger')]",
        EXPANDER_ICON_DIV: "//div[contains(@class,'toggle icon-arrow_drop_up')]",
        itemByName: name => {
            return `//div[contains(@id,'NamesView') and child::p[contains(@class,'xp-admin-common-sub-name') and contains(.,'${name}')]]`
        },
        contentStatusByDisplayName: (parent, displayName) => {
            return `//div[contains(@id,'ContentSummaryAndCompareStatusViewer') and descendant::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]`
        },
        contentStatusByName: name => {
            return `//div[contains(@id,'ContentSummaryAndCompareStatusViewer') and descendant::p[contains(@class,'sub-name') and contains(.,'${name}')]]`
        },
        itemTreeGridListElementByDisplayName: displayName => {
            return `(//li[contains(@id,'ContentsTreeGridListElement') and descendant::h6[contains(@class,'main-name') and contains(.,'${displayName}')]])[last()]`
        },
        archiveItemTreeGridListElementByDisplayName: displayName => {
            return `(//li[contains(@id,'ArchiveTreeListElement') and descendant::h6[contains(@class,'main-name') and contains(.,'${displayName}')]])[last()]`
        },
        archiveItemTreeGridListElementByName: name => {
            return `(//li[contains(@id,'ArchiveTreeListElement') and descendant::p[contains(@class,'sub-name') and contains(.,'${name}')]])[last()]`
        },
        itemTreeGridListElementByName: name => {
            return `//li[contains(@id,'ContentsTreeGridListElement') and descendant::p[contains(@class,'sub-name') and contains(.,'${name}')]]`
        },
    },
    INPUTS: {
        TEXT_INPUT: "//input[@type='text']",
        CHECKBOX_INPUT: "//input[@type='checkbox']",
        DROPDOWN_OPTION_FILTER_INPUT: "//input[contains(@id,'DropdownOptionFilterInput')]",
    },
    DROPDOWN_SELECTOR: {
        contentListElementByDisplayName: (container, displayName) => {
            return container +
                   `//li[contains(@id,'ContentListElement') and descendant::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]`;
        },
        // non-clickable li element in options dropdown list, it is for checking read-only status
        contentListElementByName: (container, name) => {
            return container +
                   `//li[contains(@id,'ContentListElement') and descendant::p[contains(@class,'sub-name') and contains(.,'${name}')]]`;
        },
        // clickable option in dropdown options list
        dropdownListItemByDisplayName: (container, displayName) => {
            return container +
                   `//li[contains(@class,'item-view-wrapper')]//h6[contains(@class,'main-name') and contains(.,'${displayName}')]`;
        },
        dropdownListItemByName: (container, name) => {
            return container +
                   `//li[contains(@class,'item-view-wrapper')]//p[contains(@class,'sub-name') and contains(.,'${name}')]`;
        },
        flatModeDropdownImgItemByDisplayName: (container, displayName) => {
            return container +
                   `//li[contains(@class,'item-view-wrapper') and descendant::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]//img`;
        },
        IMG_DROPDOWN_OPT_DISPLAY_NAME_FLAT_MODE: "//li[contains(@class,'item-view-wrapper')]" +
                                                 "//div[contains(@id,'NamesView')]//h6[contains(@class,'main-name')]",
        OPTIONS_LI_ELEMENT: "//li[contains(@id,'ContentListElement')]",
        DROPDOWN_HANDLE: "//button[contains(@id,'DropdownHandle')]",
        OPTION_FILTER_INPUT: "//input[contains(@id,'OptionFilterInput') and contains(@class, 'option-filter-input')]",
        MODE_TOGGLER_BUTTON: "//button[contains(@id,'ModeTogglerButton')]",
        APPLY_SELECTION_BUTTON: "//button[contains(@class,'apply-selection-button')]",
        CONTENT_TREE_SELECTOR: "//div[contains(@id,'ContentTreeSelectorDropdown')]",
        CONTENTS_TREE_LIST_UL: "//ul[contains(@id,'ContentsTreeList')]",
        DROPDOWN_LIST_ITEM: "//li[contains(@class,'item-view-wrapper')]",
        WIDGET_FILTER_DROPDOWN: `//div[contains(@id,'WidgetFilterDropdown')]`,
        FILTERABLE_LISTBOX: "//div[contains(@id,'FilterableListBoxWrapper')]",
    },
    DIV: {
        FRAGMENT_DROPDOWN_DIV: `//div[contains(@id,'FragmentDropdown')]`,
        CHECKBOX_DIV: "//div[contains(@id,'Checkbox')]",
        DROPDOWN_DIV: "//div[contains(@id,'Dropdown')]",
        NOTIFICATION_ACTIONS_DIV: "//div[@class='notification-actions']",
        CONTENT_SUMMARY_AND_STATUS_VIEWER: "//div[contains(@id,'ContentSummaryAndCompareStatusViewer')]",
    },
});
