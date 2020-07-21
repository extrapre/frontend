import {
    getCommonHeader,
    getCommonContainer,
    getCommonCard,
    getCommonGrayCard
} from "egov-ui-framework/ui-config/screens/specs/utils";
import { prepareFinalObject } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import { getQueryArg, setDocuments } from "egov-ui-framework/ui-utils/commons";
import { handleScreenConfigurationFieldChange as handleField } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import { set } from "lodash";
import { getreviewPropertyAddressDetailsMortgage, getReviewApplicantDetailsMortgage } from "./applyResource/review-applications-mortgage";
import { getMortgageSearchResults } from "../../../../ui-utils/commons";
import { getReviewDocuments } from "./applyResource/review-documents";

let applicationNumber = getQueryArg(window.location.href, "applicationNumber");

const headerrow = getCommonContainer({
  header: getCommonHeader({
    labelName: "Mortgage Application",
    labelKey: "MORTGAGE_APPLICATION_HEADER"
  }),
  applicationNumber: {
    uiFramework: "custom-atoms-local",
    moduleName: "egov-rented-properties",
    componentPath: "ApplicationNoContainer",
    props: {
      number: applicationNumber
    }
  }
});

const reviewPropertyAddressDetailsMortgage = getreviewPropertyAddressDetailsMortgage(false);
const reviewApplicantDetailsMortgage = getReviewApplicantDetailsMortgage(false);
const reviewDocuments = getReviewDocuments(false, "mortage-apply", "MortgageTemp[0].reviewDocData")

const mortgageReviewDetails = getCommonCard({
    reviewPropertyAddressDetailsMortgage,
    reviewApplicantDetailsMortgage,
    reviewDocuments
})

const beforeInitFn = async(action, state, dispatch) => {
  const applicationNumber = getQueryArg(window.location.href, "applicationNumber");
  const tenantId = getQueryArg(window.location.href, "tenantId")
    if(!!applicationNumber) {
      const queryObject = [
        {key: "applicationNumber", value: applicationNumber}
      ]
      const response = await getMortgageSearchResults(queryObject);
      if (response && response.MortgageApplications) {
      let {MortgageApplications} = response
      let applicationDocuments = MortgageApplications[0].applicationDocuments|| [];
      const removedDocs = applicationDocuments.filter(item => !item.active)
      applicationDocuments = applicationDocuments.filter(item => !!item.active)
      MortgageApplications = [{...MortgageApplications[0], applicationDocuments}]
      dispatch(prepareFinalObject("MortgageApplications", MortgageApplications))
      dispatch(
        prepareFinalObject(
          "MortgageTemp[0].removedDocs",
          removedDocs
        )
      );
      await setDocuments(
        response,
        "MortgageApplications[0].applicationDocuments",
        "MortgageTemp[0].reviewDocData",
        dispatch,'RP'
      );
      }
    }
  }
const mortgagePreviewDetails = {
    uiFramework: "material-ui",
    name: "mortgage-search-preview",
    beforeInitScreen: (action, state, dispatch) => {
        beforeInitFn(action, state, dispatch)
        return action
    },
    components: {
        div: {
            uiFramework: "custom-atoms",
            componentPath: "Div",
            props: {
              className: "common-div-css search-preview"
            },
            children: {
              headerDiv: {
                uiFramework: "custom-atoms",
                componentPath: "Container",
                children: {
                  header1: {
                    gridDefination: {
                      xs: 12,
                      sm: 8
                    },
                   ...headerrow
                  },
                  helpSection: {
                    uiFramework: "custom-atoms",
                    componentPath: "Container",
                    props: {
                      color: "primary",
                      style: { justifyContent: "flex-end" }
                    },
                    gridDefination: {
                      xs: 12,
                      sm: 4,
                      align: "right"
                    }
                  }
                  }
                },
                // taskStatus: {
                //   uiFramework: "custom-containers-local",
                //   moduleName: "egov-rented-properties",
                //   componentPath: "WorkFlowContainer",
                //   props: {
                //     dataPath: "Owners",
                //     moduleName: "OwnershipTransferRP",
                //     updateUrl: "/csp/ownership-transfer/_update"
                //   }
                // },
                mortgageReviewDetails
            }
          }
    }
}

export default mortgagePreviewDetails