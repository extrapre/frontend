import { convertDateToEpoch } from "egov-ui-framework/ui-config/screens/specs/utils";
import {
  handleScreenConfigurationFieldChange as handleField,
  prepareFinalObject,
  toggleSnackbar,
  toggleSpinner
} from "egov-ui-framework/ui-redux/screen-configuration/actions";
import { httpRequest } from "egov-ui-framework/ui-utils/api";
import { getTransformedLocale, getFileUrlFromAPI } from "egov-ui-framework/ui-utils/commons";
import { getTenantId } from "egov-ui-kit/utils/localStorageUtils";
import jp from "jsonpath";
import get from "lodash/get";
import set from "lodash/set";
import store from "ui-redux/store";
import { getTranslatedLabel } from "../ui-config/screens/specs/utils";
import printJS from 'print-js';
import axios from 'axios';
import { getQueryArg } from "egov-ui-framework/ui-utils/commons";
import { loadReceiptGenerationData } from "egov-tradelicence/ui-config/screens/specs/utils/receiptTransformer";
import { getUserInfo } from "egov-ui-kit/utils/localStorageUtils";
const handleDeletedCards = (jsonObject, jsonPath, key) => {
  let originalArray = get(jsonObject, jsonPath, []);
  let modifiedArray = originalArray.filter(element => {
    return element.hasOwnProperty(key) || !element.hasOwnProperty("isDeleted");
  });
  modifiedArray = modifiedArray.map(element => {
    if (element.hasOwnProperty("isDeleted")) {
      element["isActive"] = false;
    }
    return element;
  });
  set(jsonObject, jsonPath, modifiedArray);
};
export const getFileUrlFromAPIWS = async (fileStoreId,tenantId) => {
  const queryObject = [
  	{ key: "tenantId", value: tenantId||getTenantId() },
   // { key: "tenantId", value: tenantId || commonConfig.tenantId.length > 2 ? commonConfig.tenantId.split('.')[0] : commonConfig.tenantId },
    { key: "fileStoreIds", value: fileStoreId }
  ];
  try {
    const fileUrl = await httpRequest(
      "get",
      "/filestore/v1/files/url",
      "",
      queryObject
    );
    return fileUrl;
  } catch (e) {
    console.log(e);
  }
};
export const getLocaleLabelsforTL = (label, labelKey, localizationLabels) => {
  if (labelKey) {
    let translatedLabel = getTranslatedLabel(labelKey, localizationLabels);
    if (!translatedLabel || labelKey === translatedLabel) {
      return label;
    } else {
      return translatedLabel;
    }
  } else {
    return label;
  }
};

export const findItemInArrayOfObject = (arr, conditionCheckerFn) => {
  for (let i = 0; i < arr.length; i++) {
    if (conditionCheckerFn(arr[i])) {
      return arr[i];
    }
  }
};

export const getSearchResults = async (queryObject, dispatch) => {
  try {
    store.dispatch(toggleSpinner());
    const response = await httpRequest(
      "post",
      "/firenoc-services/v1/_search",
      "",
      queryObject
    );
    store.dispatch(toggleSpinner());
    return response;
  } catch (error) {
    store.dispatch(
      toggleSnackbar(
        true,
        { labelName: error.message, labelKey: error.message },
        "error"
      )
    );
    throw error;
  }
};

export const createUpdateNocApplication = async (state, dispatch, status) => {
  let nocId = get(
    state,
    "screenConfiguration.preparedFinalObject.FireNOCs[0].id"
  );
  let method = nocId ? "UPDATE" : "CREATE";
  try {
    let payload = get(
      state.screenConfiguration.preparedFinalObject,
      "FireNOCs",
      []
    );
    let tenantId = get(
      state.screenConfiguration.preparedFinalObject,
      "FireNOCs[0].fireNOCDetails.propertyDetails.address.city",
      getTenantId()
    );
    set(payload[0], "tenantId", tenantId);
    set(payload[0], "fireNOCDetails.action", status);

    // Get uploaded documents from redux
    let reduxDocuments = get(
      state,
      "screenConfiguration.preparedFinalObject.documentsUploadRedux",
      {}
    );

    handleDeletedCards(payload[0], "fireNOCDetails.buildings", "id");
    handleDeletedCards(
      payload[0],
      "fireNOCDetails.applicantDetails.owners",
      "id"
    );

    let buildings = get(payload, "[0].fireNOCDetails.buildings", []);
    buildings.forEach((building, index) => {
      // GET UOMS FOR THE SELECTED BUILDING TYPE
      let requiredUoms = get(
        state,
        "screenConfiguration.preparedFinalObject.applyScreenMdmsData.firenoc.BuildingType",
        []
      ).filter(buildingType => {
        return buildingType.code === building.usageType;
      });
      requiredUoms = get(requiredUoms, "[0].uom", []);
      // GET UNIQUE UOMS LIST INCLUDING THE DEFAULT
      let allUoms = [
        ...new Set([
          ...requiredUoms,
          ...[
            "NO_OF_FLOORS",
            "NO_OF_BASEMENTS",
            "PLOT_SIZE",
            "BUILTUP_AREA",
            "HEIGHT_OF_BUILDING"
          ]
        ])
      ];
      let finalUoms = [];
      allUoms.forEach(uom => {
        let value = get(building.uomsMap, uom);
        value &&
          finalUoms.push({
            code: uom,
            value: parseInt(value),
            isActiveUom: requiredUoms.includes(uom) ? true : false,
            active: true
          });
      });

      // Quick fix to repair old uoms
      let oldUoms = get(
        payload[0],
        `fireNOCDetails.buildings[${index}].uoms`,
        []
      );
      oldUoms.forEach((oldUom, oldUomIndex) => {
        set(
          payload[0],
          `fireNOCDetails.buildings[${index}].uoms[${oldUomIndex}].isActiveUom`,
          false
        );
        set(
          payload[0],
          `fireNOCDetails.buildings[${index}].uoms[${oldUomIndex}].active`,
          false
        );
      });
      // End Quick Fix

      set(payload[0], `fireNOCDetails.buildings[${index}].uoms`, [
        ...finalUoms,
        ...oldUoms
      ]);

      // Set building documents
      let uploadedDocs = [];
      jp.query(reduxDocuments, "$.*").forEach(doc => {
        if (doc.documents && doc.documents.length > 0) {
          if (
            doc.documentSubCode &&
            doc.documentSubCode.startsWith("BUILDING.BUILDING_PLAN")
          ) {
            if (doc.documentCode === building.name) {
              uploadedDocs = [
                ...uploadedDocs,
                {
                  tenantId: tenantId,
                  documentType: doc.documentSubCode,
                  fileStoreId: doc.documents[0].fileStoreId
                }
              ];
            }
          }
        }
      });
      set(
        payload[0],
        `fireNOCDetails.buildings[${index}].applicationDocuments`,
        uploadedDocs
      );
    });

    // Set owners & other documents
    let ownerDocuments = [];
    let otherDocuments = [];
    jp.query(reduxDocuments, "$.*").forEach(doc => {
      if (doc.documents && doc.documents.length > 0) {
        if (doc.documentType === "OWNER") {
          ownerDocuments = [
            ...ownerDocuments,
            {
              tenantId: tenantId,
              documentType: doc.documentSubCode
                ? doc.documentSubCode
                : doc.documentCode,
              fileStoreId: doc.documents[0].fileStoreId
            }
          ];
        } else if (!doc.documentSubCode) {
          // SKIP BUILDING PLAN DOCS
          otherDocuments = [
            ...otherDocuments,
            {
              tenantId: tenantId,
              documentType: doc.documentCode,
              fileStoreId: doc.documents[0].fileStoreId
            }
          ];
        }
      }
    });

    set(
      payload[0],
      "fireNOCDetails.applicantDetails.additionalDetail.documents",
      ownerDocuments
    );
    set(
      payload[0],
      "fireNOCDetails.additionalDetail.documents",
      otherDocuments
    );

    // Set Channel and Financial Year
    process.env.REACT_APP_NAME === "Citizen"
      ? set(payload[0], "fireNOCDetails.channel", "CITIZEN")
      : set(payload[0], "fireNOCDetails.channel", "COUNTER");
    set(payload[0], "fireNOCDetails.financialYear", "2019-20");

    // Set Dates to Epoch
    let owners = get(payload[0], "fireNOCDetails.applicantDetails.owners", []);
    owners.forEach((owner, index) => {
      set(
        payload[0],
        `fireNOCDetails.applicantDetails.owners[${index}].dob`,
        convertDateToEpoch(get(owner, "dob"))
      );
    });

    let response;
    if (method === "CREATE") {
      response = await httpRequest(
        "post",
        "/firenoc-services/v1/_create",
        "",
        [],
        { FireNOCs: payload }
      );
      response = furnishNocResponse(response);
      dispatch(prepareFinalObject("FireNOCs", response.FireNOCs));
      setApplicationNumberBox(state, dispatch);
    } else if (method === "UPDATE") {
      response = await httpRequest(
        "post",
        "/firenoc-services/v1/_update",
        "",
        [],
        { FireNOCs: payload }
      );
      response = furnishNocResponse(response);
      dispatch(prepareFinalObject("FireNOCs", response.FireNOCs));
    }

    return { status: "success", message: response };
  } catch (error) {
    dispatch(toggleSnackbar(true, { labelName: error.message }, "error"));

    // Revert the changed pfo in case of request failure
    let fireNocData = get(
      state,
      "screenConfiguration.preparedFinalObject.FireNOCs",
      []
    );
    fireNocData = furnishNocResponse({ FireNOCs: fireNocData });
    dispatch(prepareFinalObject("FireNOCs", fireNocData.FireNOCs));

    return { status: "failure", message: error };
  }
};

export const prepareDocumentsUploadData = (state, dispatch) => {
  let documents = get(
    state,
    "screenConfiguration.preparedFinalObject.applyScreenMdmsData.FireNoc.Documents",
    []
  );
  documents = documents.filter(item => {
    return item.active;
  });
  let documentsContract = [];
  let tempDoc = {};
  documents.forEach(doc => {
    let card = {};
    card["code"] = doc.documentType;
    card["title"] = doc.documentType;
    card["cards"] = [];
    tempDoc[doc.documentType] = card;
  });

  documents.forEach(doc => {
    // Handle the case for multiple muildings
    if (
      doc.code === "BUILDING.BUILDING_PLAN" &&
      doc.hasMultipleRows &&
      doc.options
    ) {
      let buildingsData = get(
        state,
        "screenConfiguration.preparedFinalObject.FireNOCs[0].fireNOCDetails.buildings",
        []
      );

      buildingsData.forEach(building => {
        let card = {};
        card["name"] = building.name;
        card["code"] = doc.code;
        card["hasSubCards"] = true;
        card["subCards"] = [];
        doc.options.forEach(subDoc => {
          let subCard = {};
          subCard["name"] = subDoc.code;
          subCard["required"] = subDoc.required ? true : false;
          card.subCards.push(subCard);
        });
        tempDoc[doc.documentType].cards.push(card);
      });
    } else {
      let card = {};
      card["name"] = doc.code;
      card["code"] = doc.code;
      card["required"] = doc.required ? true : false;
      if (doc.hasDropdown && doc.dropdownData) {
        let dropdown = {};
        dropdown.label = "NOC_SELECT_DOC_DD_LABEL";
        dropdown.required = true;
        dropdown.menu = doc.dropdownData.filter(item => {
          return item.active;
        });
        dropdown.menu = dropdown.menu.map(item => {
          return { code: item.code, label: getTransformedLocale(item.code) };
        });
        card["dropdown"] = dropdown;
      }
      tempDoc[doc.documentType].cards.push(card);
    }
  });

  Object.keys(tempDoc).forEach(key => {
    documentsContract.push(tempDoc[key]);
  });

  dispatch(prepareFinalObject("documentsContract", documentsContract));
};

export const prepareDocumentsUploadRedux = (state, dispatch) => {
  const {
    documentsList,
    documentsUploadRedux = {},
    prepareFinalObject
  } = this.props;
  let index = 0;
  documentsList.forEach(docType => {
    docType.cards &&
      docType.cards.forEach(card => {
        if (card.subCards) {
          card.subCards.forEach(subCard => {
            let oldDocType = get(
              documentsUploadRedux,
              `[${index}].documentType`
            );
            let oldDocCode = get(
              documentsUploadRedux,
              `[${index}].documentCode`
            );
            let oldDocSubCode = get(
              documentsUploadRedux,
              `[${index}].documentSubCode`
            );
            if (
              oldDocType != docType.code ||
              oldDocCode != card.name ||
              oldDocSubCode != subCard.name
            ) {
              documentsUploadRedux[index] = {
                documentType: docType.code,
                documentCode: card.name,
                documentSubCode: subCard.name
              };
            }
            index++;
          });
        } else {
          let oldDocType = get(documentsUploadRedux, `[${index}].documentType`);
          let oldDocCode = get(documentsUploadRedux, `[${index}].documentCode`);
          if (oldDocType != docType.code || oldDocCode != card.name) {
            documentsUploadRedux[index] = {
              documentType: docType.code,
              documentCode: card.name,
              isDocumentRequired: card.required,
              isDocumentTypeRequired: card.dropdown
                ? card.dropdown.required
                : false
            };
          }
        }
        index++;
      });
  });
  prepareFinalObject("documentsUploadRedux", documentsUploadRedux);
};

export const furnishNocResponse = response => {
  // Handle applicant ownership dependent dropdowns
  let ownershipType = get(
    response,
    "FireNOCs[0].fireNOCDetails.applicantDetails.ownerShipType"
  );
  set(
    response,
    "FireNOCs[0].fireNOCDetails.applicantDetails.ownerShipMajorType",
    ownershipType == undefined ? "SINGLE" : ownershipType.split(".")[0]
  );

  // Prepare UOMS and Usage Type Dropdowns in required format
  let buildings = get(response, "FireNOCs[0].fireNOCDetails.buildings", []);
  buildings.forEach((building, index) => {
    let uoms = get(building, "uoms", []);
    let uomMap = {};
    uoms.forEach(uom => {
      uomMap[uom.code] = `${uom.value}`;
    });
    set(
      response,
      `FireNOCs[0].fireNOCDetails.buildings[${index}].uomsMap`,
      uomMap
    );

    let usageType = get(building, "usageType");
    set(
      response,
      `FireNOCs[0].fireNOCDetails.buildings[${index}].usageTypeMajor`,
      usageType == undefined ? "" : usageType.split(".")[0]
    );
  });

  return response;
};

export const setApplicationNumberBox = (state, dispatch, applicationNo) => {
  if (!applicationNo) {
    applicationNo = get(
      state,
      "screenConfiguration.preparedFinalObject.FireNOCs[0].fireNOCDetails.applicationNumber",
      null
    );
  }

  if (applicationNo) {
    dispatch(
      handleField(
        "apply",
        "components.div.children.headerDiv.children.header.children.applicationNumber",
        "visible",
        true
      )
    );
    dispatch(
      handleField(
        "apply",
        "components.div.children.headerDiv.children.header.children.applicationNumber",
        "props.number",
        applicationNo
      )
    );
  }
};

export const downloadReceiptFromFilestoreID=(fileStoreId,mode,tenantId)=>{
  getFileUrlFromAPIWS(fileStoreId,tenantId).then(async(fileRes) => {
 // getFileUrlFromAPI(fileStoreId,tenantId).then(async(fileRes) => {
    if (mode === 'download') {
      var win = window.open(fileRes[fileStoreId], '_blank');
      if(win){
        win.focus();
      }
    }
    else {
     // printJS(fileRes[fileStoreId])
      var response =await axios.get(fileRes[fileStoreId], {
        //responseType: "blob",
        responseType: "arraybuffer",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/pdf"
        }
      });
      console.log("responseData---",response);
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      var myWindow = window.open(fileURL);
      if (myWindow != undefined) {
        myWindow.addEventListener("load", event => {
          myWindow.focus();
          myWindow.print();
        });
      }
    
    }
  });
}
export const epochToYmdDate = et => {
  if (!et) return null;
  if (typeof et === "string") return et;
  let d = new Date(et),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};
export const download  = async ( state, dispatch, mode = "download") => {
  let businessServiceInfo = get(state.screenConfiguration.preparedFinalObject, "businessServiceInfo", {});
  let businessServicewsbillreceipt = get(state.screenConfiguration.preparedFinalObject, "businessServicewsbillreceipt", '');
  let billGeneration = get(state.screenConfiguration.preparedFinalObject, "billGeneration", []);
   console.log(businessServiceInfo);
   const receiptQueryString = [
                 { key: "receiptNumbers", value: getQueryArg(window.location.href, "receiptNumber") },
                 { key: "tenantId", value: getQueryArg(window.location.href, "tenantId") }
             ]
   const FETCHRECEIPT = {
     GET: {
       URL: "/collection-services/payments/_search",
       ACTION: "_get",
     },
   };
   const DOWNLOADRECEIPT = {
     GET: {
       URL: "/pdf-service/v1/_create",
       ACTION: "_get",
     },
   };
   try {
     let keyvalue ='consolidatedreceipt'
     let KeytenantId =receiptQueryString[1].value
     if(businessServicewsbillreceipt ==='WS.ONE_TIME_FEE' || businessServicewsbillreceipt ==='SW.ONE_TIME_FEE')
       {
        keyvalue ='ws-bill-receipt' 
       }
       else if(businessServicewsbillreceipt ==='WS')
       {
        keyvalue ='ws-bill'        
        
       }
     else
       if (businessServiceInfo.code.includes("CTL"))
       {
        keyvalue ='tl-receipt'
        //KeytenantId =receiptQueryString[1].value
        loadReceiptGenerationData(getQueryArg(window.location.href, "consumerCode"), getQueryArg(window.location.href, "tenantId"), state, dispatch);
       }

     else {
        KeytenantId =receiptQueryString[1].value.split('.')[0]

       }

     httpRequest("post", FETCHRECEIPT.GET.URL, FETCHRECEIPT.GET.ACTION, receiptQueryString).then((payloadReceiptDetails) => {
       const queryStr = [
         { key: "key", value: keyvalue },
         { key: "tenantId", value: KeytenantId }
       ]
       if(payloadReceiptDetails&&payloadReceiptDetails.Payments&&payloadReceiptDetails.Payments.length==0){
         console.log("Could not find any receipts");   
         return;
       }
       if(businessServicewsbillreceipt ==='WS')
       {
        httpRequest("post", DOWNLOADRECEIPT.GET.URL, DOWNLOADRECEIPT.GET.ACTION, queryStr, { billGeneration: billGeneration }, { 'Accept': 'application/json' }, { responseType: 'arraybuffer' })
        .then(res => {
          res.filestoreIds[0]
          if(res&&res.filestoreIds&&res.filestoreIds.length>0){
            res.filestoreIds.map(fileStoreId=>{
              downloadReceiptFromFilestoreID(fileStoreId,"download",KeytenantId)
            })          
          }else{
            console.log("Error In Receipt Download");        
          }         
        });
       }
       else if(businessServicewsbillreceipt ==='WS.ONE_TIME_FEE'|| businessServicewsbillreceipt ==='SW.ONE_TIME_FEE')
      
       {
         let paymentReceiptDate = 0;
         let paidAmount =0;
         let dueAmount = 0;
         if(payloadReceiptDetails&&payloadReceiptDetails.Payments&&payloadReceiptDetails.Payments.length>0)
         {
          paymentReceiptDate = epochToYmdDate(get(payloadReceiptDetails, "Payments[0].transactionDate", ''))
          paidAmount = get(payloadReceiptDetails, "Payments[0].paymentDetails[0].totalAmountPaid", '')
          dueAmount = get(payloadReceiptDetails, "Payments[0].paymentDetails[0].totalDue", '')

         }
        billGeneration =[
          {
            div: get(state.screenConfiguration.preparedFinalObject, "WaterConnection[0].div", ''),
            subDiv: get(state.screenConfiguration.preparedFinalObject, "WaterConnection[0].subdiv", ''),
            applicationNumber:getQueryArg(window.location.href, "consumerCode"),
            receiptNumber:getQueryArg(window.location.href, "receiptNumber"),
            activityType: get(state.screenConfiguration.preparedFinalObject, "WaterConnection[0].activityType", ''),
            applicantName: get(state.screenConfiguration.preparedFinalObject, "WaterConnection[0].connectionHolders[0].name", ''),
            applicantAddress: get(state.screenConfiguration.preparedFinalObject, "WaterConnection[0].connectionHolders[0].correspondenceAddress", ''),
            paymentReceiptDate:paymentReceiptDate,
            dueAmount: dueAmount,
            paidAmount:paidAmount,
            status:'Payment complete',
          }
        ]

        httpRequest("post", DOWNLOADRECEIPT.GET.URL, DOWNLOADRECEIPT.GET.ACTION, queryStr, { WSReceiptRequest: billGeneration }, { 'Accept': 'application/json' }, { responseType: 'arraybuffer' })
        .then(res => {
          res.filestoreIds[0]
          if(res&&res.filestoreIds&&res.filestoreIds.length>0){
            res.filestoreIds.map(fileStoreId=>{
              downloadReceiptFromFilestoreID(fileStoreId,"download",KeytenantId)
            })          
          }else{
            console.log("Error In Receipt Download");        
          }         
        });
       }
       else if(businessServiceInfo.code.includes('CTL'))
       {
        const data = function() {
          let data1 = get(
            state.screenConfiguration.preparedFinalObject,
            "applicationDataForReceipt",
            {}
          );
          let data2 = get(
            state.screenConfiguration.preparedFinalObject,
            "receiptDataForReceipt",
            {}
          );
          let data3 = get(
            state.screenConfiguration.preparedFinalObject,
            "mdmsDataForReceipt",
            {}
          );
          let data4 = get(
            state.screenConfiguration.preparedFinalObject,
            "userDataForReceipt",
            {}
          );
          return {...data1, ...data2, ...data3, ...data4}
         }
         const { Licenses } = state.screenConfiguration.preparedFinalObject;
         let {Payments} = payloadReceiptDetails;
         let {billAccountDetails} = Payments[0].paymentDetails[0].bill.billDetails[0];
         billAccountDetails = billAccountDetails.map(({taxHeadCode, ...rest}) => ({
           ...rest,
           taxHeadCode: taxHeadCode.includes("_FEE") ? "TL_FEE" : taxHeadCode.includes("_PENALTY") ? "TL_TIME_PENALTY" : taxHeadCode.includes("_TAX") ? "TL_TAX" : taxHeadCode.includes("_ROUNDOFF") ? "TL_ROUNDOFF" : taxHeadCode.includes("REHRI_REGISTRATION_CHARGES") ? "TL_CHARGES"  : taxHeadCode
         }))
         Payments = [{...Payments[0], paymentDetails: [{...Payments[0].paymentDetails[0], bill: {...Payments[0].paymentDetails[0].bill, billDetails: [{...Payments[0].paymentDetails[0].bill.billDetails[0],billAccountDetails }] } }]}]
   
         let data1 = data();
         let generateBy = JSON.parse(getUserInfo()).name;
         httpRequest("post", DOWNLOADRECEIPT.GET.URL, DOWNLOADRECEIPT.GET.ACTION, queryStr, { Payments, Licenses, data1, generateBy }, { 'Accept': 'application/json' }, { responseType: 'arraybuffer' })
         .then(res => {
           res.filestoreIds[0]
           if(res&&res.filestoreIds&&res.filestoreIds.length>0){
             res.filestoreIds.map(fileStoreId=>{
               downloadReceiptFromFilestoreID(fileStoreId,"download")
             })          
           }else{
             console.log("Error In Receipt Download");        
           }         
         });
       }
       else{
        httpRequest("post", DOWNLOADRECEIPT.GET.URL, DOWNLOADRECEIPT.GET.ACTION, queryStr, { Payments: payloadReceiptDetails.Payments }, { 'Accept': 'application/json' }, { responseType: 'arraybuffer' })
        .then(res => {
          res.filestoreIds[0]
          if(res&&res.filestoreIds&&res.filestoreIds.length>0){
            res.filestoreIds.map(fileStoreId=>{
              downloadReceiptFromFilestoreID(fileStoreId,"download")
            })          
          }else{
            console.log("Error In Receipt Download");        
          }         
        });
       }
      
     })
   } catch (exception) {
     alert('Some Error Occured while downloading Receipt!');
   }
 }
 export const downloadprint  = async ( state, dispatch, mode = "download") => {
  let businessServiceInfo = get(state.screenConfiguration.preparedFinalObject, "businessServiceInfo", {});
  let businessServicewsbillreceipt = get(state.screenConfiguration.preparedFinalObject, "businessServicewsbillreceipt", '');
  let billGeneration = get(state.screenConfiguration.preparedFinalObject, "billGeneration", []);
   console.log(businessServiceInfo);
   const receiptQueryString = [
                 { key: "receiptNumbers", value: getQueryArg(window.location.href, "receiptNumber") },
                 { key: "tenantId", value: getQueryArg(window.location.href, "tenantId") }
             ]
   const FETCHRECEIPT = {
     GET: {
       URL: "/collection-services/payments/_search",
       ACTION: "_get",
     },
   };
   const DOWNLOADRECEIPT = {
     GET: {
       URL: "/pdf-service/v1/_create",
       ACTION: "_get",
     },
   };
   try {
     let keyvalue ='consolidatedreceipt'
     let KeytenantId =receiptQueryString[1].value
     if(businessServiceInfo.code ==='WS')
       {
        keyvalue ='ws-bill'
         
        if(businessServicewsbillreceipt === 'WS')
        {
          keyvalue ='ws-bill-receipt'
        }
        //KeytenantId =receiptQueryString[1].value
       }
     else  if (businessServiceInfo.code.includes("CTL"))
       {
        keyvalue ='tl-receipt'
        //KeytenantId =receiptQueryString[1].value
        loadReceiptGenerationData(getQueryArg(window.location.href, "consumerCode"), getQueryArg(window.location.href, "tenantId"), state, dispatch);
       }

     else {
        KeytenantId =receiptQueryString[1].value.split('.')[0]

       }

     httpRequest("post", FETCHRECEIPT.GET.URL, FETCHRECEIPT.GET.ACTION, receiptQueryString).then((payloadReceiptDetails) => {
       const queryStr = [
         { key: "key", value: keyvalue },
         { key: "tenantId", value: KeytenantId }
       ]
       if(payloadReceiptDetails&&payloadReceiptDetails.Payments&&payloadReceiptDetails.Payments.length==0){
         console.log("Could not find any receipts");   
         return;
       }
       if(businessServicewsbillreceipt ==='WS.ONE_TIME_FEE'||businessServicewsbillreceipt ==='SW.ONE_TIME_FEE')
       {
        httpRequest("post", DOWNLOADRECEIPT.GET.URL, DOWNLOADRECEIPT.GET.ACTION, queryStr, { billGeneration: billGeneration }, { 'Accept': 'application/json' }, { responseType: 'arraybuffer' })
        .then(res => {
          res.filestoreIds[0]
          if(res&&res.filestoreIds&&res.filestoreIds.length>0){
            res.filestoreIds.map(fileStoreId=>{
              downloadReceiptFromFilestoreID(fileStoreId,"print",KeytenantId)
            })          
          }else{
            console.log("Error In Receipt Download");        
          }         
        });
       }
      else if(businessServicewsbillreceipt ==='WS')
       {
         let paymentReceiptDate = 0;
         let paidAmount =0;
         let dueAmount = 0;
         if(payloadReceiptDetails&&payloadReceiptDetails.Payments&&payloadReceiptDetails.Payments.length>0)
         {
          paymentReceiptDate = epochToYmdDate(get(payloadReceiptDetails, "Payments[0].transactionDate", ''))
          paidAmount = get(payloadReceiptDetails, "Payments[0].paymentDetails[0].totalAmountPaid", '')
          dueAmount = get(payloadReceiptDetails, "Payments[0].paymentDetails[0].totalDue", '')

         }
        billGeneration =[
          {
            div: get(state.screenConfiguration.preparedFinalObject, "WaterConnection[0].div", ''),
            subDiv: get(state.screenConfiguration.preparedFinalObject, "WaterConnection[0].subdiv", ''),
            applicationNumber:getQueryArg(window.location.href, "consumerCode"),
            receiptNumber:getQueryArg(window.location.href, "receiptNumber"),
            activityType: get(state.screenConfiguration.preparedFinalObject, "WaterConnection[0].activityType", ''),
            applicantName: get(state.screenConfiguration.preparedFinalObject, "WaterConnection[0].connectionHolders[0].name", ''),
            applicantAddress: get(state.screenConfiguration.preparedFinalObject, "WaterConnection[0].connectionHolders[0].correspondenceAddress", ''),
            paymentReceiptDate:paymentReceiptDate,
            dueAmount: dueAmount,
            paidAmount:paidAmount,
            status:'Payment complete',
          }
        ]

        httpRequest("post", DOWNLOADRECEIPT.GET.URL, DOWNLOADRECEIPT.GET.ACTION, queryStr, { WSReceiptRequest: billGeneration }, { 'Accept': 'application/json' }, { responseType: 'arraybuffer' })
        .then(res => {
          res.filestoreIds[0]
          if(res&&res.filestoreIds&&res.filestoreIds.length>0){
            res.filestoreIds.map(fileStoreId=>{
              downloadReceiptFromFilestoreID(fileStoreId,"print",KeytenantId)
            })          
          }else{
            console.log("Error In Receipt Download");        
          }         
        });
       }
       else if(businessServiceInfo.code.includes('CTL'))
       {
        const data = function() {
          let data1 = get(
            state.screenConfiguration.preparedFinalObject,
            "applicationDataForReceipt",
            {}
          );
          let data2 = get(
            state.screenConfiguration.preparedFinalObject,
            "receiptDataForReceipt",
            {}
          );
          let data3 = get(
            state.screenConfiguration.preparedFinalObject,
            "mdmsDataForReceipt",
            {}
          );
          let data4 = get(
            state.screenConfiguration.preparedFinalObject,
            "userDataForReceipt",
            {}
          );
          return {...data1, ...data2, ...data3, ...data4}
         }
         const { Licenses } = state.screenConfiguration.preparedFinalObject;
         let {Payments} = payloadReceiptDetails;
         let {billAccountDetails} = Payments[0].paymentDetails[0].bill.billDetails[0];
         billAccountDetails = billAccountDetails.map(({taxHeadCode, ...rest}) => ({
           ...rest,
           taxHeadCode: taxHeadCode.includes("_FEE") ? "TL_FEE" : taxHeadCode.includes("_PENALTY") ? "TL_TIME_PENALTY" : taxHeadCode.includes("_TAX") ? "TL_TAX" : taxHeadCode.includes("_ROUNDOFF") ? "TL_ROUNDOFF" : taxHeadCode.includes("REHRI_REGISTRATION_CHARGES") ? "TL_CHARGES"  : taxHeadCode
         }))
         Payments = [{...Payments[0], paymentDetails: [{...Payments[0].paymentDetails[0], bill: {...Payments[0].paymentDetails[0].bill, billDetails: [{...Payments[0].paymentDetails[0].bill.billDetails[0],billAccountDetails }] } }]}]
   
         let data1 = data();
         let generateBy = JSON.parse(getUserInfo()).name;
         httpRequest("post", DOWNLOADRECEIPT.GET.URL, DOWNLOADRECEIPT.GET.ACTION, queryStr, { Payments, Licenses, data1, generateBy }, { 'Accept': 'application/json' }, { responseType: 'arraybuffer' })
         .then(res => {
           res.filestoreIds[0]
           if(res&&res.filestoreIds&&res.filestoreIds.length>0){
             res.filestoreIds.map(fileStoreId=>{
               downloadReceiptFromFilestoreID(fileStoreId,"print")
             })          
           }else{
             console.log("Error In Receipt Download");        
           }         
         });
       }
       else{
        httpRequest("post", DOWNLOADRECEIPT.GET.URL, DOWNLOADRECEIPT.GET.ACTION, queryStr, { Payments: payloadReceiptDetails.Payments }, { 'Accept': 'application/json' }, { responseType: 'arraybuffer' })
        .then(res => {
          res.filestoreIds[0]
          if(res&&res.filestoreIds&&res.filestoreIds.length>0){
            res.filestoreIds.map(fileStoreId=>{
              downloadReceiptFromFilestoreID(fileStoreId,"print")
            })          
          }else{
            console.log("Error In Receipt Download");        
          }         
        });
       }
      
     })
   } catch (exception) {
     alert('Some Error Occured while downloading Receipt!');
   }
 }





export const downloadBill = async (consumerCode ,tenantId) => {
  const searchCriteria = {
    consumerCode ,
    tenantId
  }
  const FETCHBILL={
    GET:{
      URL:"egov-searcher/bill-genie/billswithaddranduser/_get",
      ACTION: "_get",
    }
  }
  const DOWNLOADRECEIPT = {
      GET: {
          URL: "/pdf-service/v1/_create",
          ACTION: "_get",
      },
  };
  const billResponse = await httpRequest("post", FETCHBILL.GET.URL, FETCHBILL.GET.ACTION, [],{searchCriteria});
  const queryStr = [
            { key: "key", value: "consolidatedbill" },
            { key: "tenantId", value: "ch" }
        ]
  const pfResponse = await httpRequest("post", DOWNLOADRECEIPT.GET.URL, DOWNLOADRECEIPT.GET.ACTION, queryStr, { Bill: billResponse.Bills }, { 'Accept': 'application/pdf' }, { responseType: 'arraybuffer' })
  downloadReceiptFromFilestoreID(pfResponse.filestoreIds[0],'download');
}

