import {
  getCommonHeader,
  getLabel,
  getBreak
} from "egov-ui-framework/ui-config/screens/specs/utils";
import { getQueryArg } from "egov-ui-framework/ui-utils/commons";
import { searchResultsSellmeat } from "./searchResource/searchResults";
import { setBusinessServiceDataToLocalStorage } from "egov-ui-framework/ui-utils/commons";
import {
  getOPMSTenantId,
  localStorageGet,
  setapplicationType
} from "egov-ui-kit/utils/localStorageUtils";
import find from "lodash/find";
import set from "lodash/set";
import get from "lodash/get";
import {
  prepareFinalObject,
  handleScreenConfigurationFieldChange as handleField
} from "egov-ui-framework/ui-redux/screen-configuration/actions";
import { getRequiredDocuments } from "./requiredDocuments/reqDocs";
import { getGridDataSellMeat, getTextForSellMeatNoc } from "./searchResource/citizenSearchFunctions";
import { SearchFormForEmployee } from "./searchResource/EmployeeSearchForm";
import "./searchGrid.css";
import { getBusinessServiceData } from "../../../../ui-utils/commons";

const hasButton = getQueryArg(window.location.href, "hasButton");
let enableButton = true;
enableButton = hasButton && hasButton === "false" ? false : true;

const header = getCommonHeader({
  labelName: "SELL MEAT NOC",
  labelKey: "SELLMEAT_COMMON_NOC"
});

const setApplicationStatus = async (state, dispatch) => { 
  let businessServiceData = await getBusinessServiceData("SELLMEATNOC");
  if (businessServiceData) {
    const data = find(businessServiceData.BusinessServices, { businessService: "SELLMEATNOC" });
    const { states } = data || [];
    if (states && states.length > 0) {
      const status = states.map((item, index) => {
        return {
          code: item.state,
          name: getTextForSellMeatNoc(item.state)
        }
      });
      let arr = status.slice(1)
      
      dispatch(
        prepareFinalObject(
          "applyScreenMdmsData.searchScreen.status",
          arr.filter(item => item.code != null)
        )
      );
    }
  }
}

const NOCSearchAndResult = {
  uiFramework: "material-ui",
  name: "sellmeat-search",
  beforeInitScreen: (action, state, dispatch) => {
    setapplicationType("SELLMEATNOC")

    //getGridDataSellMeat(action, state, dispatch);
    // const tenantId = getOPMSTenantId();
    // const BSqueryObject = [
    //   { key: "tenantId", value: tenantId },
    //   { key: "businessServices", value: "SELLMEATNOC" }
    // ];
    // setBusinessServiceDataToLocalStorage(BSqueryObject, dispatch);
    // const businessServiceData = JSON.parse(
    //   localStorageGet("businessServiceData")
    // );
    
    dispatch(
      prepareFinalObject(
        "OPMS.searchFilter",
        {}
      )
    );

    setApplicationStatus(state, dispatch);
     return action;
  },
  components: {
    div: {
      uiFramework: "custom-atoms",
      componentPath: "Form",
      props: {
        className: "common-div-css",
        id: "sellmeat-search"
      },
      children: {
        headerDiv: {
          uiFramework: "custom-atoms",
          componentPath: "Container",

          // children: {
          //   header: {
          //     gridDefination: {
          //       xs: 12,
          //       sm: 6
          //     },
          //     ...header
          //   },
          //   newApplicationButton: {
          //     componentPath: "Button",
          //     gridDefination: {
          //       xs: 12,
          //       sm: 6,
          //       align: "right"
          //     },
          //     visible: enableButton,
          //     props: {
          //       variant: "contained",
          //       color: "primary",
          //       style: {
          //         color: "white",
          //         borderRadius: "2px",
          //         width: "250px",
          //         height: "48px"
          //       }
          //     },

          //     children: {
          //       plusIconInsideButton: {
          //         uiFramework: "custom-atoms",
          //         componentPath: "Icon",
          //         props: {
          //           iconName: "add",
          //           style: {
          //             fontSize: "24px"
          //           }
          //         }
          //       },

          //       buttonLabel: getLabel({
          //         labelName: "NEW APPLICATION",
          //         labelKey: "NOC_HOME_SEARCH_RESULTS_NEW_APP_BUTTON"
          //       })
          //     },
          //     onClickDefination: {
          //       action: "condition",
          //       callBack: (state, dispatch) => {
          //         pageResetAndChange(state, dispatch);
          //         showHideAdhocPopup(state, dispatch, "search");
          //       }
          //     },
          //     roleDefination: {
          //       rolePath: "user-info.roles",
          //       roles: ["NOC_CEMP", "SUPERUSER"]
          //     }
          //   }
          // }
        },
        // pendingApprovals,
        // NOCApplication,
        SearchFormForEmployee,

        breakAfterSearch: getBreak(),
        // progressStatus,
        searchResultsSellmeat
      }
    },
    adhocDialog: {
      uiFramework: "custom-containers-local",
      moduleName: "egov-opms",
      componentPath: "DialogContainer",
      props: {
        open: false,
        maxWidth: false,
        screenKey: "sellmeat-search"
      },
      children: {
        popup: {}
      }
    }
  }
};

export default NOCSearchAndResult;
