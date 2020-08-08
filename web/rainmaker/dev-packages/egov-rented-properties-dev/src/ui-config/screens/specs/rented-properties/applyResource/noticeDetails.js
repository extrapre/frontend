import { getCommonCard, getSelectField, getTextField, getDateField, getCommonTitle, getPattern, getCommonContainer } from "egov-ui-framework/ui-config/screens/specs/utils";
import { prepareFinalObject } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import { getTodaysDateInYMD } from "../../utils";
import get from "lodash/get";
import { getDetailsFromProperty ,getDuplicateDetailsFromProperty} from "../../../../../ui-utils/apply";
export const propertyHeader = getCommonTitle(
    {
        labelName: "Property Details",
        labelKey: "RP_PROPERTY_DETAILS_HEADER"
    },
    {
        style: {
                marginBottom: 18,
                marginTop: 18
        }
    }
  )
  const rentHolderHeader = getCommonTitle(
    {
        labelName: "Rent holder Particulars",
        labelKey: "RP_RENT_HOLDER_PARTICULAR_HEADER"
    },
    {
        style: {
                marginBottom: 18,
                marginTop: 18
        }
    }
  )  
const fatherOrHusbandsNameField = {
    label: {
        labelName: "Father/ Husband's Name",
        labelKey: "TL_FATHER_OR_HUSBANDS_NAME_LABEL"
    },
    placeholder: {
        labelName: "Enter Father/ Husband's Name",
        labelKey: "TL_FATHER_OR_HUSBANDS_NAME_NAME_PLACEHOLDER"
    },
    gridDefination: {
        xs: 12,
        sm: 6
    },
    minLength: 4,
    maxLength: 40,
    required: true,
    jsonPath: "Properties[0].owners[0].ownerDetails.fatherOrHusband"
}

const getEditorField = {
    gridDefination: {
        xs: 12,
        sm: 6
    },
    label: {
        labelName: "Editor",
        labelKey: "RP_EDITOR_LABEL"
    },
    placeholder: { 
        labelName: "Editor",
        labelKey: "RP_EDITOR_LABEL"
    },
    props:{
        multiline: true,
        rows: "4"
    },
    visible: true,
    jsonPath: "Properties[0].owners[0].ownerDetails.editor" 
  }

const ownerNameField = {
    label: {
        labelName: "Owner Name",
        labelKey: "RP_OWNER_NAME_LABEL"
    },
    placeholder: {
        labelName: "Enter Owner Name",
        labelKey: "RP_OWNER_NAME_PLACEHOLDER"
    },
    gridDefination: {
        xs: 12,
        sm: 6
    },
    minLength: 4,
    maxLength: 40,
    required: true,
    jsonPath: "Properties[0].owners[0].ownerDetails.name"
  }

const originalAllotteField = {
    label: {
        labelName: "Original Allottee",
        labelKey: "RP_ORIGINAL_ALLOTTEE_LABEL"
    },
    placeholder: {
        labelName: "Enter Original Allottee Name",
        labelKey: "RP_ORIGINAL_ALLOTTEE_PLACEHOLDER"
    },
    gridDefination: {
        xs: 12,
        sm: 6
    },
    minLength: 4,
    maxLength: 40,
    jsonPath: "Properties[0].owners[0].ownerDetails.name"
}

const getDocumentField = {
    label: {
        labelName: "Documents Given",
        labelKey: "RP_DOCUMENTS_GIVEN_LABEL"
    },
    placeholder: {
        labelName: "Documents Given",
        labelKey: "RP_DOCUMENTS_GIVEN_LABEL"
    },
    gridDefination: {
        xs: 12,
        sm: 6
    },
    minLength: 4,
    maxLength: 40,
    jsonPath: "Properties[0].owners[0].ownerDetails.documentsGiven" 
}

const getViolationField = {
    label: {
        labelName: "Violations",
        labelKey: "RP_VIOLATIONS_LABEL"
    },
    placeholder: {
        labelName: "Enter Comments",
        labelKey: "RP_VIOLATIONS_PLACEHOLDER"
    },
    gridDefination: {
        xs: 12,
        sm: 6
    },
    props:{
        multiline: true,
        rows: "4"
    },
    jsonPath: "SingleImage[0].description" 
}

export const transitNumberConfig = {
    label: {
        labelName: "Transit Site/Plot number",
        labelKey: "RP_SITE_PLOT_LABEL"
    },
    placeholder: {
        labelName: "Enter Transit Site/Plot number",
        labelKey: "RP_SITE_PLOT_PLACEHOLDER"
    },
    gridDefination: {
        xs: 12,
        sm: 6
    },
    minLength: 4,
    maxLength: 25,
    required: true,
}

const transitNumberField = {
    ...transitNumberConfig,
    jsonPath: "Properties[0].transitNumber"
  }
  const allotmentNumberField = {
    label: {
        labelName: "Allotment Number",
        labelKey: "RP_ALLOTMENT_NUMBER_LABEL"
    },
    placeholder: {
        labelName: "Enter Allotment Number",
        labelKey: "RP_ALLOTMENT_NUMBER_PLACEHOLDER"
    },
    gridDefination: {
        xs: 12,
        sm: 6
    },
    minLength: 3,
    maxLength: 20,
    required: true,
    jsonPath: "Properties[0].owners[0].allotmenNumber"
  }  

  const memoDateField = {
        label: {
            labelName: "Memo Date",
            labelKey: "RP_MEMO_DATE_LABEL"
        },
        placeholder: {
            labelName: "Enter Memo Date",
            labelKey: "RP_MEMO_DATE_PLACEHOLDER"
        },
        pattern: getPattern("Date"),
        jsonPath: "Properties[0].owners[0].ownerDetails.memoDate",
        props: {
            inputProps: {
                max: getTodaysDateInYMD()
            }
        }
      }

const demandNoticeFromDate = {
    label: {
        labelName: "Demand Notice First Date",
        labelKey: "RP_DEMAND_NOTICE_FIRST_DATE"
    },
    placeholder: {
        labelName: "Demand Notice First Date",
        labelKey: "RP_DEMAND_DATE_PLACEHOLDER"
    },
    required: true,
    pattern: getPattern("Date"),
    jsonPath: "Properties[0].owners[0].ownerDetails.demandStartdate",
    props: {
        inputProps: {
            max: getTodaysDateInYMD()
        }
    }
  }

  const demandNoticeLastDate = {
    label: {
        labelName: "Demand Notice Last Date",
        labelKey: "RP_DEMAND_NOTICE_LAST_DATE"
    },
    placeholder: {
        labelName: "Demand Notice Last Date",
        labelKey: "RP_DEMAND_DATE_PLACEHOLDER"
    },
    required: true,
    pattern: getPattern("Date"),
    jsonPath: "Properties[0].owners[0].ownerDetails.demandlastdate",
    props: {
        inputProps: {
            max: getTodaysDateInYMD()
        }
    }
  }
  const recoveryType = {
    label: {
        labelName: "Recovery Type",
        labelKey: "RP_RECOVERY_TYPE"
    },
    placeholder: {
        labelName: "Enter Recovery Type",
        labelKey: "RP_RECOVERY_TYPE_PLACEHOLDER"
    },
    required: true,
    jsonPath: "Properties[0].colony",
    optionValue: "code",
    optionLabel: "label",
    sourceJsonPath: "applyScreenMdmsData.propertyTypes",
    jsonPath: "Properties[0].owners[0].ownerDetails.recoveryType" 
}



const paymentAmountFieldNotice = {
    label: {
        labelName: "Payment Amount",
        labelKey: "RP_PAYMENT_AMOUNT_LABEL"
    },
    placeholder: {
        labelName: "Enter Payment Amount",
        labelKey: "RP_PAYMENT_AMOUNT"
    },
    minLength: 4,
    maxLength: 25,
    required: true,
    jsonPath: "Properties[0].owners[0].ownerDetails.payment[0].amountPaid"

}
const getOwnerDetailsForNotice = () => {
    return {
        header: rentHolderHeader,
        detailsContainer: getCommonContainer({
        fatherOrHusbandsName:getTextField(fatherOrHusbandsNameField),
        originalAllotte :getTextField(originalAllotteField),
        violations:getTextField(getViolationField),
        editor : getTextField(getEditorField),
        })
    }
}

const getPropertyDetailsForNotice = () => {
    return {
        header: propertyHeader,
        detailsContainer: getCommonContainer({
            transitNumber: getTextField(transitNumberField),
            allotmentNumber: getTextField(allotmentNumberField),
            memoDate: getDateField(memoDateField),
        })
    }
}
const getPaymentDetailsNotice = () => {
    return {
            detailsContainer: getCommonContainer({    
            demandNoticeFromDate: getDateField(demandNoticeFromDate),
            demandNoticeLastDate: getDateField(demandNoticeLastDate),
            recoveryType: getSelectField(recoveryType),
            paymentAmount: getTextField(paymentAmountFieldNotice),
        })
    }
}

export const ownerDetailsForNotice = getCommonCard(getOwnerDetailsForNotice())
export const noticePropertyDetails = getCommonCard(getPropertyDetailsForNotice())

export const paymentDetailsNotice=getCommonCard(getPaymentDetailsNotice())









