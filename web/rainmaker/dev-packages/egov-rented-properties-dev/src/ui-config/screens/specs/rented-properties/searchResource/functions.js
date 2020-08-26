import get from "lodash/get";
import set from "lodash/set";
import { handleScreenConfigurationFieldChange as handleField } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import { getSearchResults, getCount, getDuplicateCopySearchResults , getOwnershipSearchResults, getMortgageSearchResults} from "../../../../..//ui-utils/commons";
import {
  convertEpochToDate,
  convertDateToEpoch,
  getTextToLocalMapping
} from "../../utils/index";
import { toggleSnackbar, prepareFinalObject } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import { validateFields } from "../../utils";
import { getTenantId } from "egov-ui-kit/utils/localStorageUtils";
import { setBusinessServiceDataToLocalStorage, getLocaleLabels } from "egov-ui-framework/ui-utils/commons";
import commonConfig from "config/common.js";
import { httpRequest } from "../../../../../ui-utils"
import { APPLICATION_NO, PROPERTY_ID, OWNER_NAME, STATUS, LAST_MODIFIED_ON } from "./searchResults";

export const getStatusList = async (state, dispatch, screen, path) => {
  const queryObject = [{ key: "tenantId", value: getTenantId() }, 
                      { key: "businessServices", value: "NewTL" }]
  const businessServices = await setBusinessServiceDataToLocalStorage(queryObject, dispatch);
  if(!!businessServices) {
    const status = businessServices[0].states.filter(item => !!item.state).map(({state}) => ({code: state}))
    dispatch(
      handleField(
        screen,
        path,
        "props.data",
        status
      )
    );
  }
}

export const searchTransferProperties = async (state, dispatch, onInit, offset, limit , hideTable = true) => {
  !!hideTable && showHideTable(false, dispatch, "search-transfer-properties");
  let queryObject = [
    // {
    //   key: "tenantId",
    //   value: getTenantId()
    // },
    { key: "offset", value: offset },
    { key: "limit", value: limit }
  ];
  queryObject = queryObject.filter(({value}) => !!value)
  let searchScreenObject = get(
    state.screenConfiguration.preparedFinalObject,
    "searchScreen",
    {}
  );
  const isSearchBoxFirstRowValid = validateFields(
    "components.div.children.ownerShipTransferApplication.children.cardContent.children.applicationNoContainer.children",
    state,
    dispatch,
    "search-transfer-properties"
  );

  const isSearchBoxSecondRowValid = validateFields(
    "components.div.children.ownerShipTransferApplication.children.cardContent.children.statusContainer.children",
    state,
    dispatch,
    "search-transfer-properties"
  );

  if (!(isSearchBoxFirstRowValid && isSearchBoxSecondRowValid) && typeof onInit != "boolean") {
    dispatch(
      toggleSnackbar(
        true,
        {
          labelName: "Please fill valid fields to start search",
          labelKey: "ERR_FILL_VALID_FIELDS"
        },
        "warning"
      )
    );
  } else if (
    (Object.keys(searchScreenObject).length == 0 ||
    Object.values(searchScreenObject).every(x => x === "")) && typeof onInit != "boolean"
  ) {
    dispatch(
      toggleSnackbar(
        true,
        {
          labelName: "Please fill at least one field to start search",
          labelKey: "ERR_FILL_ONE_FIELDS"
        },
        "warning"
      )
    );
  } else {
      for (var key in searchScreenObject) {
        if (
          searchScreenObject.hasOwnProperty(key) &&
          searchScreenObject[key].trim() !== ""
        ) {
            queryObject.push({ key: key, value: searchScreenObject[key].trim() });
        }
    }
    const response = await getOwnershipSearchResults(queryObject);
    try {
      let data = response.Owners.map(item => ({
        [APPLICATION_NO]: item.ownerDetails.applicationNumber || "-",
        [getTextToLocalMapping("Transit No")]: item.property.transitNumber || "-",
        // [PROPERTY_ID]: item.property.id || "-",
        [OWNER_NAME]: item.ownerDetails.name || "-",
        [STATUS]: getLocaleLabels(item.applicationState, item.applicationState) || "-",
        [LAST_MODIFIED_ON]: convertEpochToDate(item.auditDetails.lastModifiedTime) || "-"
      }));
      dispatch(
        handleField(
          "search-transfer-properties",
          "components.div.children.transferSearchResults",
          "props.data",
          data
        )
      );
      !!hideTable && showHideTable(true, dispatch, "search-transfer-properties");
    } catch (error) {
      dispatch(toggleSnackbar(true, error.message, "error"));
      console.log(error);
    }
  }
}

export const searchMortgage = async (state, dispatch, onInit, offset, limit , hideTable = true) => {
  !!hideTable && showHideTable(false, dispatch, "search-mortgage");
  let queryObject = [
    {
      key: "tenantId",
      value: getTenantId()
    },
    { key: "offset", value: offset },
    { key: "limit", value: limit }
  ];
  queryObject = queryObject.filter(({value}) => !!value)
  let searchScreenObject = get(
    state.screenConfiguration.preparedFinalObject,
    "searchScreen",
    {}
  );
  const isSearchBoxFirstRowValid = validateFields(
    "components.div.children.searchMortgageApplication.children.cardContent.children.applicationNoContainer.children",
    state,
    dispatch,
    "search-mortgage"
  );

  const isSearchBoxSecondRowValid = validateFields(
    "components.div.children.searchMortgageApplication.children.cardContent.children.statusContainer.children",
    state,
    dispatch,
    "search-mortgage"
  );

  if (!(isSearchBoxFirstRowValid && isSearchBoxSecondRowValid) && typeof onInit != "boolean") {
    dispatch(
      toggleSnackbar(
        true,
        {
          labelName: "Please fill valid fields to start search",
          labelKey: "ERR_FILL_VALID_FIELDS"
        },
        "warning"
      )
    );
  } else if (
    (Object.keys(searchScreenObject).length == 0 ||
    Object.values(searchScreenObject).every(x => x === "")) && typeof onInit != "boolean"
  ) {
    dispatch(
      toggleSnackbar(
        true,
        {
          labelName: "Please fill at least one field to start search",
          labelKey: "ERR_FILL_ONE_FIELDS"
        },
        "warning"
      )
    );
  } else {
      for (var key in searchScreenObject) {
        if (
          searchScreenObject.hasOwnProperty(key) &&
          searchScreenObject[key].trim() !== ""
        ) {
            queryObject.push({ key: key, value: searchScreenObject[key].trim() });
        }
    }
    const response = await getMortgageSearchResults(queryObject);
    try {
      let data = response.MortgageApplications.map(item => ({
        [APPLICATION_NO]: item.applicationNumber || "-",
        [getTextToLocalMapping("Transit No")]: item.property.transitNumber || "-",
        [OWNER_NAME]: item.applicant[0].name || "-",
        [STATUS]: getLocaleLabels(item.state, item.state) || "-",
        [LAST_MODIFIED_ON]: convertEpochToDate(item.auditDetails.lastModifiedTime) || "-"
      }));
      dispatch(
        handleField(
          "search-mortgage",
          "components.div.children.mortgageSearchResults",
          "props.data",
          data
        )
      );
      !!hideTable && showHideTable(true, dispatch, "search-mortgage");
    } catch (error) {
      dispatch(toggleSnackbar(true, error.message, "error"));
    }
  }
}

export const searchDuplicateCopy = async (state, dispatch, onInit, offset, limit , hideTable = true) => {
  !!hideTable && showHideTable(false, dispatch, "search-duplicate-copy");
  let queryObject = [
    {
      key: "tenantId",
      value: getTenantId()
    },
    { key: "offset", value: offset },
    { key: "limit", value: limit }
  ];
  queryObject = queryObject.filter(({value}) => !!value)
  let searchScreenObject = get(
    state.screenConfiguration.preparedFinalObject,
    "searchScreen",
    {}
  );
  const isSearchBoxFirstRowValid = validateFields(
    "components.div.children.searchDuplicateCopyApplication.children.cardContent.children.applicationNoContainer.children",
    state,
    dispatch,
    "search-duplicate-copy"
  );

  const isSearchBoxSecondRowValid = validateFields(
    "components.div.children.searchDuplicateCopyApplication.children.cardContent.children.statusContainer.children",
    state,
    dispatch,
    "search-duplicate-copy"
  );

  if (!(isSearchBoxFirstRowValid && isSearchBoxSecondRowValid) && typeof onInit != "boolean") {
    dispatch(
      toggleSnackbar(
        true,
        {
          labelName: "Please fill valid fields to start search",
          labelKey: "ERR_FILL_VALID_FIELDS"
        },
        "warning"
      )
    );
  } else if (
    (Object.keys(searchScreenObject).length == 0 ||
    Object.values(searchScreenObject).every(x => x === "")) && typeof onInit != "boolean"
  ) {
    dispatch(
      toggleSnackbar(
        true,
        {
          labelName: "Please fill at least one field to start search",
          labelKey: "ERR_FILL_ONE_FIELDS"
        },
        "warning"
      )
    );
  } else {
      for (var key in searchScreenObject) {
        if (
          searchScreenObject.hasOwnProperty(key) &&
          searchScreenObject[key].trim() !== ""
        ) {
            queryObject.push({ key: key, value: searchScreenObject[key].trim() });
        }
    }
    const response = await getDuplicateCopySearchResults(queryObject);
    try {
      let data = response.DuplicateCopyApplications.map(item => ({
        [APPLICATION_NO]: item.applicationNumber || "-",
        [getTextToLocalMapping("Transit No")]: item.property.transitNumber || "-",
        [OWNER_NAME]: item.applicant[0].name || "-",
        [STATUS]: getLocaleLabels(item.state, item.state) || "-",
        [LAST_MODIFIED_ON]: convertEpochToDate(item.auditDetails.lastModifiedTime) || "-"
      }));
      dispatch(
        handleField(
          "search-duplicate-copy",
          "components.div.children.duplicateCopySearchResult",
          "props.data",
          data
        )
      );
      !!hideTable && showHideTable(true, dispatch, "search-duplicate-copy");
    } catch (error) {
      dispatch(toggleSnackbar(true, error.message, "error"));
    }
  }
}

export const searchApiCall = async (state, dispatch, onInit, relations, offset, limit , hideTable = true) => {
  !!hideTable && showHideTable(false, dispatch, "search");
  let queryObject = [
    {
      key: "tenantId",
      value: getTenantId()
    },
    { key: "offset", value: offset },
    { key: "limit", value: limit },
    { key: "relations", value: relations}
  ];
  queryObject = queryObject.filter(({value}) => !!value)
  let searchScreenObject = get(
    state.screenConfiguration.preparedFinalObject,
    "searchScreen",
    {}
  );

  const isSearchBoxFirstRowValid = validateFields(
    "components.div.children.rentedPropertyApplication.children.cardContent.children.colonyContainer.children",
    state,
    dispatch,
    "search"
  );

  const isSearchBoxSecondRowValid = validateFields(
    "components.div.children.rentedPropertyApplication.children.cardContent.children.transitNumberContainer.children",
    state,
    dispatch,
    "search"
  );

  if (!(isSearchBoxFirstRowValid && isSearchBoxSecondRowValid) && typeof onInit != "boolean") {
    dispatch(
      toggleSnackbar(
        true,
        {
          labelName: "Please fill valid fields to start search",
          labelKey: "ERR_FILL_VALID_FIELDS"
        },
        "warning"
      )
    );
  } else if (
    (Object.keys(searchScreenObject).length == 0 ||
    Object.values(searchScreenObject).every(x => x === "")) && typeof onInit != "boolean"
  ) {
    dispatch(
      toggleSnackbar(
        true,
        {
          labelName: "Please fill at least one field to start search",
          labelKey: "ERR_FILL_ONE_FIELDS"
        },
        "warning"
      )
    );
  } else {
      for (var key in searchScreenObject) {
        if (
          searchScreenObject.hasOwnProperty(key) &&
          searchScreenObject[key].trim() !== ""
        ) {
            queryObject.push({ key: key, value: searchScreenObject[key].trim() });
        }
    }
    const response = await getSearchResults(queryObject);
    try {
      let data = response.Properties.map(item => ({
        [getTextToLocalMapping("Transit No")]: item.transitNumber || "-",
        [getTextToLocalMapping("Colony")]: getLocaleLabels(item.colony, item.colony) || "-",
        [getTextToLocalMapping("Owner")]: [item.owners.find(itemdat => itemdat.activeState === true)][0].ownerDetails.name || "-",
        [getTextToLocalMapping("Status")]: getLocaleLabels(item.masterDataState, item.masterDataState) || "-",
        [LAST_MODIFIED_ON]: convertEpochToDate(item.auditDetails.lastModifiedTime) || "-"
      }));
      dispatch(
        handleField(
          "search",
          "components.div.children.searchResults",
          "props.data",
          data
        )
      );
      !!hideTable && showHideTable(true, dispatch, "search");
    } catch (error) {
      dispatch(toggleSnackbar(true, error.message, "error"));
      console.log(error);
    }
  }
};
const showHideTable = (booleanHideOrShow, dispatch, screenKey) => {
  dispatch(
    handleField(
      screenKey,
      "components.div.children.searchResults",
      "visible",
      booleanHideOrShow
    )
  );
};

const getMdmsData = async (dispatch, body) => {
  let mdmsBody = {
    MdmsCriteria: {
      tenantId: commonConfig.tenantId,
      moduleDetails: body
    }
  };
  try {
    let payload = await httpRequest(
      "post",
      "/egov-mdms-service/v1/_search",
      "_search",
      [],
      mdmsBody
    );
    return payload;
  } catch (e) {
    console.log(e);
  }
};

export const getColonyTypes = async(action, state, dispatch) => {
  const colonyTypePayload = [{
    moduleName: "PropertyServices",
    masterDetails: [{name: "colonies"}]
  }]
  const colonyRes = await getMdmsData(dispatch, colonyTypePayload);
  const {PropertyServices = []} = colonyRes.MdmsRes || {}
  dispatch(prepareFinalObject("applyScreenMdmsData.rentedPropertyColonies", PropertyServices.colonies))
  const propertyTypes = PropertyServices.colonies.map(item => ({
    code: item.code,
    label: item.code
  }))
  dispatch(prepareFinalObject("applyScreenMdmsData.propertyTypes", propertyTypes))
}

