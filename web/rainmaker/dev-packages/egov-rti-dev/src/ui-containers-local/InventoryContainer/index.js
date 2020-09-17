import { convertDateToEpoch } from "egov-ui-framework/ui-config/screens/specs/utils";
import React, { Component } from "react";
import { Button} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import MenuButton from "egov-ui-framework/ui-molecules/MenuButton";
import { connect } from "react-redux";
import { setRoute } from "egov-ui-framework/ui-redux/app/actions";
import get from "lodash/get";
import set from "lodash/set";
import Label from "egov-ui-kit/utils/translationNode";
import {
  LabelContainer,

} from "egov-ui-framework/ui-containers";
import { prepareFinalObject } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import { toggleSnackbar } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import { downloadInventoryPdf} from '../../ui-config/screens/specs/utils'
import store from "ui-redux/store";
import { getprintpdf } from "../../ui-utils/storecommonsapi";
import "./index.scss";
import Div from "egov-ui-framework/ui-atoms/HtmlElements/Div";
class InventoryContainer extends Component {

  state = {
    open: false,
    action: ""
  };

  onPrintClick=async(Reportname)=>{  
    const { prepareFinalObject, toggleSnackbar, state,ProcessInstances } = this.props;

    try{
      let searchScreenObject = get(
              state.screenConfiguration.preparedFinalObject,
              "searchScreen",
              {}
            );
           if( Object.keys(searchScreenObject).length > 0)           
            downloadInventoryPdf(searchScreenObject,Reportname);
            else
            {
              toggleSnackbar(
                true,
                {
                labelName: "Fill Required Field !",
                labelKey: "ERR_FILL_ALL_FIELDS"
                },
                "warning"
                );

            }
    }
    catch(e)
    {
      toggleSnackbar(
        true,
        {
        labelName: "Workflow returned empty object !",
        labelKey: "PENSION_API_EXCEPTION_ERROR"
        },
        "error"
        );
        store.dispatch(toggleSpinner());

    }
   
  
    }
    componentDidMount = async () => {
      const { prepareFinalObject, toggleSnackbar } = this.props;
      
    };
    render() {
        const {  ProcessInstances,
          state,
          APIData, 
          pageName,        
          moduleName } = this.props;
console.log(APIData)
console.log("APIData")
          if(pageName ==="RTI_PT")
          {
            return  ( <div>
              {
                 APIData.length>0?(              
                  <div>               
                
               <table 
                style={{
                  width: "100%",
                }}>
               <tr><td  style={{
                  textAlign: "left",
                  width:"15%"
                }}><Label labelClassName="" label="RTI_PAYABLE_AMOUNT" /></td>
                <td><Label labelClassName="" label="0.0" /></td>
                {/* <td style={{
                  textAlign: "right",
                 
                }}> 
    
                <Button  color="primary" onClick={() => this.onPrintClick('OB')}  style={{ alignItems: "right"}}>
                                         <LabelContainer
                                                 labelName="PRINT"
                                                 labelKey="STORE_PRINT"
                                                 color="#FE7A51"/> </Button>
                </td> */}
                </tr>             
                     
              </table>
              </div>
                ):
                (
                  <div>

                  </div>
                  // <div style={{
                  //   textAlign: "right",}}>
                  //    <Button  color="primary" onClick={() => this.onPrintClick('OB')}  style={{ alignItems: "right"}}>
                  //                        <LabelContainer
                  //                                labelName="PRINT"
                  //                                labelKey="STORE_PRINT"
                  //                                color="#FE7A51"/> </Button>
                  // </div>
                )
              }         
             {
              //  APIData&&APIData[0]&&( 
               <div style={{ overscrollBehaviorX:"overlay",overflow:"overlay"}}>
                 
                  <table  id="reportTable"
                 style={{
                   width: "100%",
                   marginBottom:"20px"
                 }}
                 className="table table-striped table-bordered">
                 <thead>
                 <tr className="report-table-header">
                 <th   style={{ verticalAlign:"middle", textAlign: "center"}} rowspan="1">
                  <Label
                    className="report-header-row-label"
                    labelStyle={{ wordWrap: "unset", wordBreak: "unset", fontWeight: "bold", }}
                    label="RTI_FINANCIAL_YEAR"
                  />
                  </th>
                  <th  style={{ verticalAlign:"middle", textAlign: "center"}} colSpan="1">
                  <Label
                    className="report-header-row-label"
                    labelStyle={{ wordWrap: "unset", wordBreak: "unset", fontWeight: "bold", }}
                    label="RTI_DUE_AMOUNT"
                  />
                  </th>
                  <th  style={{ verticalAlign:"middle", textAlign: "center"}} colSpan="1">
                  <Label
                    className="report-header-row-label"
                    labelStyle={{ wordWrap: "unset", wordBreak: "unset", fontWeight: "bold", }}
                    label="RTI_DISCOUNT"
                  />
                  </th>
                  <th  style={{ verticalAlign:"middle", textAlign: "center"}} colSpan="1">
                  <Label
                    className="report-header-row-label"
                    labelStyle={{ wordWrap: "unset", wordBreak: "unset", fontWeight: "bold", }}
                    label="RTI_DEPOSIT_AMOUNT"
                  />
                  </th>
                  <th  style={{ verticalAlign:"middle", textAlign: "center"}} colSpan="1">
                  <Label
                    className="report-header-row-label"
                    labelStyle={{ wordWrap: "unset", wordBreak: "unset", fontWeight: "bold", }}
                    label="RTI_AMOUNT_OF_INTEREST"
                  />
                  </th>
                  <th  style={{ verticalAlign:"middle", textAlign: "center"}} colSpan="1">
                  <Label
                    className="report-header-row-label"
                    labelStyle={{ wordWrap: "unset", wordBreak: "unset", fontWeight: "bold", }}
                    label="RTI_BALANCE_AMOUNT"
                  />
                  </th>                  
                 </tr>
                
                 {
                   APIData&&(
                     <tr>
                       {
                          APIData.length==0?(                     
                            
                              <th  style={{ verticalAlign:"middle", textAlign: "center"}}colSpan="9" ><Label labelClassName="" label="COMMON_INBOX_NO_DATA" /></th>
                           
                           
                          ):(
                            <div  style={{ display:"none"}}></div>
                          )
                       }
                     </tr>
                   )
                 }
                 </thead>
                 {
                    APIData&&(
                      <tbody>
                         {
                           APIData.length==0?(
                            
                             <tr  style={{ display:"none"}}>
                               <th  style={{ verticalAlign:"middle", textAlign: "center"}} colSpan="2"><Label labelClassName="" label="COMMON_INBOX_NO_DATA" /></th>
                             </tr>
                            
                           ):(
                            APIData.OpeningBalanceReport[0].balanceDetails.map((item,i)=>{
                              return(
                                <tr>
                                  <th>{item.srNo}</th>
                                  <th>{item.materialCode}</th>
                                  <th>{item.materialName}</th>
                                  <th>{item.materialType}</th>
                                  <th>{item.uomName}</th>
                                  <th>{item.quantity}</th>
                                  <th>{item.unitRate}</th>
                                  <th>{item.totalAmount}</th>
                                  <th>{item.remarks}</th>
                                 
                                </tr>
                              )
                            
                            })
                           )
                          
                         }
    
                    </tbody>
                    )                
                  }
                 </table>
                 </div>
               //)
            }
               
               </div>);

          }
          else if(pageName ==="RTI_NODAL")
          {
            return  ( <div>
                    
             {
              //  APIData&&APIData[0]&&( 
               <div style={{ overscrollBehaviorX:"overlay",overflow:"overlay"}}>
                 
                  <table  id="reportTable"
                 style={{
                   width: "100%",
                   marginBottom:"20px"
                 }}
                 className="table table-striped table-bordered">
                 <thead>
                 <tr className="report-table-header">
                 <th   style={{ verticalAlign:"middle", textAlign: "center"}} rowspan="2">
                  <Label
                    className="report-header-row-label"
                    labelStyle={{ wordWrap: "unset", wordBreak: "unset", fontWeight: "bold", }}
                    label="RTI_MINISTRY_NAME"
                  />
                  </th>
                  <th  style={{ verticalAlign:"middle", textAlign: "center"}} colSpan="2">
                  <Label
                    className="report-header-row-label"
                    labelStyle={{ wordWrap: "unset", wordBreak: "unset", fontWeight: "bold", }}
                    label="RTI_APPELLATE_AUTHORITY"
                  />
                  </th>
                 
                  <th  style={{ verticalAlign:"middle", textAlign: "center"}} colSpan="2">
                  <Label
                    className="report-header-row-label"
                    labelStyle={{ wordWrap: "unset", wordBreak: "unset", fontWeight: "bold", }}
                    label="RTI_NODAL_OFFICER"
                  />
                  </th>             
                  <th  style={{ verticalAlign:"middle", textAlign: "center"}} colSpan="2">
                  <Label
                    className="report-header-row-label"
                    labelStyle={{ wordWrap: "unset", wordBreak: "unset", fontWeight: "bold", }}
                    label="RTI_CPIO"
                  />
                  </th>             
                           
                 </tr>
                 <tr>
                
                  <th  style={{ verticalAlign:"middle", textAlign: "center",columnSpan:"1"}}>
                  <Label
                    className="report-header-row-label"
                    labelStyle={{ wordWrap: "unset", wordBreak: "unset", fontWeight: "bold", }}
                    label="RTI_TOTAL_REQUEST_RECEIVED"
                  />
                 </th>
                 <th  style={{ verticalAlign:"middle", textAlign: "center",columnSpan:"1"}}>
                 <Label
                    className="report-header-row-label"
                    labelStyle={{ wordWrap: "unset", wordBreak: "unset", fontWeight: "bold", }}
                    label="RTI_TOTAL_REQUEST_PENDING"
                  />
                 </th>
                 <th  style={{ verticalAlign:"middle", textAlign: "center",columnSpan:"1"}}>
                 <Label
                    className="report-header-row-label"
                    labelStyle={{ wordWrap: "unset", wordBreak: "unset", fontWeight: "bold", }}
                    label="RTI_TOTAL_REQUEST_RECEIVED"
                  />
                 </th>
                 <th  style={{ verticalAlign:"middle", textAlign: "center",columnSpan:"1"}}>
                 <Label
                    className="report-header-row-label"
                    labelStyle={{ wordWrap: "unset", wordBreak: "unset", fontWeight: "bold", }}
                    label="RTI_TOTAL_REQUEST_PENDING"
                  />
                 </th>
                 <th  style={{ verticalAlign:"middle", textAlign: "center",columnSpan:"1"}}>
                 <Label
                    className="report-header-row-label"
                    labelStyle={{ wordWrap: "unset", wordBreak: "unset", fontWeight: "bold", }}
                    label="RTI_TOTAL_REQUEST_RECEIVED"
                  />
                 </th>
                 <th  style={{ verticalAlign:"middle", textAlign: "center",columnSpan:"1"}}>
                 <Label
                    className="report-header-row-label"
                    labelStyle={{ wordWrap: "unset", wordBreak: "unset", fontWeight: "bold", }}
                    label="RTI_TOTAL_REQUEST_PENDING"
                  />
                 </th>
                 
                 </tr>
                 {
                   APIData&&(
                     <tr>
                       {
                          APIData.length==0?(                      
                            
                              <th  style={{ verticalAlign:"middle", textAlign: "center"}}colSpan="21" ><Label labelClassName="" label="COMMON_INBOX_NO_DATA" /></th>
                           
                           
                          ):(
                            <div  style={{ display:"none"}}></div>
                          )
                       }
                     </tr>
                   )
                 }
                 </thead>
                 {
                    APIData&&(
                      <tbody>
                         {
                           APIData.length==0?(
                            
                             <tr  style={{ display:"none"}}>
                               <th  style={{ verticalAlign:"middle", textAlign: "center",columnSpan:"21"}} ><Label labelClassName="" label="COMMON_INBOX_NO_DATA" /></th>
                             </tr>
                            
                           ):(
                           
                            APIData[0].invetoryDetails.map((item,i)=>{
                              return(
                                <tr>
                                  <th>{item.srNo}</th>
                                  <th>{item.openingQty}</th>
                                  <th>{item.openingUom}</th>
                                  <th>{item.openingRate}</th>
                                  <th>{item.receiptDate}</th>
                                  <th>{item.receiptNo}</th>
                                  <th>{item.receiptDepartment}</th>
                                 
                                </tr>
                              )                            
                            })
                           )
                          
                         }
    
                    </tbody>
                    )                
                  }
                 </table>
                 </div>
               //)
            }
               
               </div>);

          }
          

      }
  }
  const mapStateToProps = state => {
    const { auth, app } = state;
    const { menu } = app;
    const { userInfo } = auth;
    const name = auth && userInfo.name;
    let APIData = get(
      state,
      "screenConfiguration.preparedFinalObject.APIData",
      []
    );
    return { name, menu,state,APIData };
  };


  const mapDispacthToProps = dispatch => {
    return {
      prepareFinalObject: (path, value) =>
        dispatch(prepareFinalObject(path, value)),
      toggleSnackbar: (open, message, variant) =>
        dispatch(toggleSnackbar(open, message, variant)),dispatch
    };
  };
  export default connect(
    mapStateToProps,
    mapDispacthToProps
    
  )(InventoryContainer);