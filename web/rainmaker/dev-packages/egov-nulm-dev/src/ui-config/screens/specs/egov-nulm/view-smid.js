import {
    getCommonHeader,
    getCommonContainer
  } from "egov-ui-framework/ui-config/screens/specs/utils";
  import set from "lodash/set";
  import { SMIDReviewDetails } from "./viewSMIDResource/smid-review";
  import { poViewFooter } from "./viewSMIDResource/footer";
  import { getQueryArg,getFileUrlFromAPI,getFileUrl } from "egov-ui-framework/ui-utils/commons";
  import { getTenantId,getUserInfo } from "egov-ui-kit/utils/localStorageUtils";
  import { httpRequest } from "../../../../ui-utils";
  import { prepareFinalObject } from "egov-ui-framework/ui-redux/screen-configuration/actions";
  import { getSearchResults } from "../../../../ui-utils/commons";
  let applicationNumber = getQueryArg(window.location.href, "applicationNumber");
  let status = getQueryArg(window.location.href, "status");

  const applicationNumberContainer = () => {

    if (applicationNumber)
      return {
        uiFramework: "custom-atoms-local",
        moduleName: "egov-nulm",
        componentPath: "ApplicationNoContainer",
        props: {
          number: `${applicationNumber}`,
          visibility: "hidden"
        },
        visible: true
      };
    else return {};
  };
  const statusContainer = () => {
 
  if(status)
      return {
      uiFramework: "custom-atoms-local",
      moduleName: "egov-nulm",
      componentPath: "ApplicationStatusContainer",
      props: {
       status: `${status}`,
        visibility: "hidden"
      },
      visible: true
    };
   else return {};
 };
  export const header = getCommonContainer({
    header: getCommonHeader({
      labelName: `View SMID`,
      labelKey: "NULM_SMID_VIEW"
    }),
    applicationNumber: applicationNumberContainer(),
    status: statusContainer()
  });
  
  const tradeView = SMIDReviewDetails(false);
  
  const getMdmsData = async (action, state, dispatch, tenantId) => {
    const tenant = tenantId || getTenantId();
    let mdmsBody = {
      MdmsCriteria: {
        tenantId: tenant,
        moduleDetails: [
          {
            moduleName: "egov-hrms",
            masterDetails: [
              {
                name: "DeactivationReason",
                filter: "[?(@.active == true)]"
              }
            ]
          }
        ]
      }
    };
    try {
      const payload = await httpRequest(
        "post",
        "/egov-mdms-service/v1/_search",
        "_search",
        [],
        mdmsBody
      );
      dispatch(prepareFinalObject("viewScreenMdmsData", payload.MdmsRes));
    } catch (e) {
      console.log(e);
    }
  };
  const getFileUrlDetails = async (state,dispatch,tenantId,response)=>{
    //mdms call
    getMdmsData(dispatch, tenantId);

   const fileStoreIds = response.ResponseBody[0].documentAttachemnt;


   const fileUrlPayload =  fileStoreIds && (await getFileUrlFromAPI(fileStoreIds));

   if(fileUrlPayload){
   let  documentsUploadRedux ={}
  const documentsPreview = [  {    title: "smidDocument",
                                    linkText: "VIEW", 
                                    link :  (fileUrlPayload &&
                                                    fileUrlPayload[fileStoreIds] &&
                                                    getFileUrl(fileUrlPayload[fileStoreIds])) ||
                                                    "",
                                     name:   (fileUrlPayload &&
                                                      fileUrlPayload[fileStoreIds] &&
                                                      decodeURIComponent(
                                                        getFileUrl(fileUrlPayload[fileStoreIds])
                                                          .split("?")[0]
                                                          .split("/")
                                                          .pop().slice(13)
                                                      )) ||
                                                    `Document - ${index + 1}` 
                                        }
                                      ];
                                        //for populating in update mode
                                        documentsUploadRedux[0] = {                          
                                          "documents":[
                                          {
                                          "fileName":  (fileUrlPayload &&
                                            fileUrlPayload[fileStoreIds] &&
                                            decodeURIComponent(
                                              getFileUrl(fileUrlPayload[fileStoreIds])
                                                .split("?")[0]
                                                .split("/")
                                                .pop().slice(13)
                                            )) ||
                                          `Document - 1`,
                                          "fileStoreId": fileStoreIds,
                                          "fileUrl": fileUrlPayload[fileStoreIds]
                                         }
                                        ]
                                       }
                                  
          documentsPreview && dispatch(prepareFinalObject("documentsPreview", documentsPreview));
         documentsPreview &&  dispatch(prepareFinalObject("documentsUploadRedux", documentsUploadRedux));
         }
                       
   
  }

  const getSMIDDetails = async(state, dispatch) =>{
    
    const tenantId = process.env.REACT_APP_NAME === "Employee" ?  getTenantId() : JSON.parse(getUserInfo()).permanentCity;
  
    let NULMSMIDRequest = {};
    NULMSMIDRequest.tenantId = tenantId;
    NULMSMIDRequest.applicationId= applicationNumber;
    const requestBody = {NULMSMIDRequest}
    let response = await getSearchResults([],requestBody, dispatch,"smid");
  
    if(response){ 
      getFileUrlDetails(state,dispatch,tenantId,response);
      dispatch(prepareFinalObject("NULMSMIDRequest", response.ResponseBody[0]));
      if( response.ResponseBody[0]){

        const NULMSMIDRequest = { ...response.ResponseBody[0]};
        const radioButtonValue = ["isUrbanPoor","isPwd","isMinority","isInsurance","isStreetVendor","isHomeless"];
      
        radioButtonValue.forEach(value => {
          if(NULMSMIDRequest[value] && NULMSMIDRequest[value]=== true ){
            dispatch(prepareFinalObject(`NULMSMIDRequest[${value}]`, "YES" ));
          }else{
            dispatch(prepareFinalObject(`NULMSMIDRequest[${value}]`, "NO" ));
          }
        })
  
        dispatch(prepareFinalObject(`NULMSMIDRequest.dob`, NULMSMIDRequest.dob.split(" ")[0] ));
      }
    }
  }
  
  const screenConfig = {
    uiFramework: "material-ui",
    name: "view-smid",
    beforeInitScreen: (action, state, dispatch) => {
      getSMIDDetails(state, dispatch);
      set(
        action.screenConfig,
        "components.div.children.headerDiv.children.header.children.applicationNumber.props.number",
        applicationNumber
      );
      set(
        action.screenConfig,
        "components.div.children.headerDiv.children.header.children.status.props.status",
        status
      );
      return action;
    },
    components: {
      div: {
        uiFramework: "custom-atoms",
        componentPath: "Div",
        props: {
          className: "common-div-css"
        },
        children: {
          headerDiv: {
            uiFramework: "custom-atoms",
            componentPath: "Container",
            children: {
              header: {
                gridDefination: {
                  xs: 12,
                  sm: 10
                },
                ...header
              }
            }
          },
          tradeView,
          footer: poViewFooter()
        }
      },
    }
  };
  
  export default screenConfig;
  