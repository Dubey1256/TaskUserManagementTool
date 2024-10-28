import * as React from 'react'; 
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { Web } from "sp-pnp-js";
import { DefaultButton } from 'office-ui-fabric-react';
import ImagesC from '../../EditPopupFiles/Image';
import { PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/PeoplePicker';
import { useState } from 'react';

const EditUserComponent = (props: any) => {
    const [EditData, setEditData] = React.useState<any>({});


    // const updateUser = async () => {
    //     let web = new Web(props.baseUrl);
    //     if (props.memberToUpdate) {
    //         const updatedData = {
    //             Title: title ? title : props.memberToUpdate.Title,
    //             Suffix: suffix ? suffix : props.memberToUpdate.Suffix,
    //             SortOrder: sortOrder ? sortOrder : props.memberToUpdate.SortOrder,
    //             IsActive: isActive,
    //             Company: selectedCompany,
    //             TimeCategory: userCategory ? userCategory : props.memberToUpdate.userCategory,
    //             Role: { "results": selectedRoles },
    //             IsTaskNotifications: isTaskNotifications,
    //             AssingedToUserId: assignedToUser.length > 0 ? assignedToUser[0]?.AssingedToUser?.Id : null,
    //             ApproverId: approver.length > 0 ? { "results": [approver[0]?.Id] } : null,
    //             UserGroupId: userGroup ? parseInt(userGroup) : props.memberToUpdate?.UserGroup?.Id,
    //             Item_x0020_Cover: { "__metadata": { type: "SP.FieldUrlValue" }, Description: "Description", Url: props.imageUrl?.Item_x002d_Image != undefined ? props.imageUrl?.Item_x002d_Image?.Url : (props.imageUrl?.Item_x0020_Cover != undefined ? props.imageUrl?.Item_x0020_Cover?.Url : null) },
    //         };

    //         await web.lists.getById(props.TaskUserListId).items.getById(props.memberToUpdate.Id).update(updatedData).then((res: any) => {
    //             console.log('Updated Data:', updatedData);

    //             // Update the data and groupData states
    //             const updatedMemberData = props.data.map(item => {
    //                 if (item.Id === props.memberToUpdate.Id) {
    //                     return { ...item, ...updatedData };
    //                 }
    //                 return item;
    //             });

    //             setData(updatedMemberData);
    //             // Update memberToUpdate state if necessary
    //             setMemberToUpdate((prevState: any) => ({ ...prevState, ...updatedData }));

    //             setOpenUpdateMemberPopup(false);
    //             fetchAPIData()
    //         }).catch(error => {
    //             console.error("Error updating item: ", error);
    //         });
    //     }
    // };


    const userIdentifier = props.memberToUpdate?.AssingedToUser?.Name;
    const email = userIdentifier ? userIdentifier.split('|').pop() : '';

    const userIdentifier2 = props.memberToUpdate?.Approver?.[0]?.Name;
    const email2 = userIdentifier2 ? userIdentifier2.split('|').pop() : '';

    const AssignedToUser = (item: any) => {
        if (item.length > 0) {
            const email = item.length > 0 ? item[0].loginName.split('|').pop() : null;
            const member = props.data.filter((elem: any) => elem.Email === email)
            props.setAssignedToUser(member)
        }
        else {
            props.setAssignedToUser([])
        }
    }

    const ApproverFunction = (item: any) => {
        if (item.length > 0) {
            const email = item.length > 0 ? item[0].loginName.split('|').pop() : null;
            const member = props.data.filter((elem: any) => elem.Email === email)
            props.setApprover(member)
        }
        else {
            props.setApprover([])
        }
    }

    const imageTabCallBack = React.useCallback((data: any) => {
        setEditData(data);
        console.log(EditData);
        console.log(data);
    }, []);

    return (
        <Panel
            headerText="Update User"
            type={PanelType.custom}
            customWidth="1280px"
            isOpen={props.openUpdateMemberPopup}
            onDismiss={props.handleDismiss}
            isFooterAtBottom={true}
            isBlocking={!props.openUpdateMemberPopup}
        >
            <ul className="nav nav-tabs" id="myTab" role="tablist">
                <li className="nav-item" role="presentation">
                    <button className="nav-link active" id="basic-info-tab" data-bs-toggle="tab" data-bs-target="#basicInfo" type="button" role="tab" aria-controls="basicInfo" aria-selected="true">
                        Basic Information
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button className="nav-link" id="image-info-tab" data-bs-toggle="tab" data-bs-target="#imageInfo" type="button" role="tab" aria-controls="imageInfo" aria-selected="false">
                        Image Information
                    </button>
                </li>
            </ul>

            <div className="tab-content" id="myTabContent">
                {/* Basic Information Tab */}
                <div
                    className="tab-pane fade show active"
                    id="basicInfo"
                    role="tabpanel"
                    aria-labelledby="basic-info-tab"
                >
                    <div className="add-datapanel">
                        <label className='form-label mb-0 mt-2 w-100'>Title: </label>
                        <input className='form-control' type="text" defaultValue={props.memberToUpdate?.Title} onChange={(e: any) => props.setTitle(e.target.value)} />

                        <label className='form-label mb-0 mt-2 w-100'>Suffix: </label>
                        <input className='form-control' type="text" defaultValue={props.memberToUpdate?.Suffix} onChange={(e: any) => props.setSuffix(e.target.value)} />

                        <label className='form-label mb-0 mt-2 w-100'>User Name:</label>
                        <PeoplePicker context={props.context} titleText="" personSelectionLimit={1} showHiddenInUI={false}
                            principalTypes={[PrincipalType.User]} resolveDelay={1000} onChange={(items) => AssignedToUser(items)}
                            defaultSelectedUsers={email ? [email] : []} />


                        <label className='form-label mb-0 mt-2 w-100'>Group: </label>
                        <select id="sites" defaultValue={props.memberToUpdate?.UserGroup?.Id} onChange={(e: any) => props.setUserGroup(e.target.value)}>
                            <option>Select</option>
                            {props.TaskGroupsListData.map((elem: any) => <option value={elem?.Id}>{elem?.Title}</option>)}
                        </select>

                        <label className='form-label mb-0 mt-2 w-100'>Sort Order: </label>
                        <input className='form-control' type="text" defaultValue={props.memberToUpdate?.SortOrder} onChange={(e: any) => props.setSortOrder(e.target.value)} />

                        <label className='form-label mb-0 mt-2 w-100'>Manage Categories: </label>
                        <select id="sites" defaultValue={props.memberToUpdate?.TimeCategory} onChange={(e: any) => props.setUserCategory(e.target.value)}>
                            <option>Select</option>
                            {props.uniqueCategories.map((elem: any) => <option value={elem.Title}>{elem.Title}</option>)}
                        </select>

                        <label className='form-label mb-0 mt-2 w-100'>Approver:</label>
                        <PeoplePicker context={props.context} titleText="" personSelectionLimit={1} showHiddenInUI={false} principalTypes={[PrincipalType.User]} resolveDelay={1000} onChange={(items) => ApproverFunction(items)} defaultSelectedUsers={email2 ? [email2] : []} />

                        <label className='form-label mb-0 mt-2 w-100'>Approval Type: </label>
                        <div>
                            <input type="radio" id="Approve All" name="approvalType" value="Approve All" checked={props.selectedApprovalType === 'Approve All'} onChange={props.handleApprovalTypeChange} />
                            <label htmlFor="approveAll">Approve All</label><br />
                            <input type="radio" id="Approve Selected" name="approvalType" value="Approve Selected" checked={props.selectedApprovalType === 'Approve Selected'} onChange={props.handleApprovalTypeChange} />
                            <label htmlFor="approveSelected">Approve Selected</label><br />
                            <input type="radio" id="Decide Case By Case" name="approvalType" value="Decide Case By Case" checked={props.selectedApprovalType === 'Decide Case By Case'} onChange={props.handleApprovalTypeChange} />
                            <label htmlFor="caseByCase">Case by Case</label>
                        </div>

                        <label className='form-label mb-0 mt-2 w-100'>Company: </label>
                        <div>
                            <input type="radio" id="HHHH" name="company" value="HHHH" checked={props.selectedCompany === 'HHHH'} onChange={props.handleCompanyChange} />
                            <label htmlFor="companyHHHH">HHHH Team</label><br />
                            <input type="radio" id="Smalsus" name="company" value="Smalsus" checked={props.selectedCompany === 'Smalsus'} onChange={props.handleCompanyChange} />
                            <label htmlFor="companySmalsus">Smalsus Team</label>
                        </div>

                        <label className='form-label mb-0 mt-2 w-100'>Roles: </label>
                        <div>
                            {['Component Teams', 'Service Teams'].map((role: any) => (
                                <React.Fragment key={role}>
                                    <input type="checkbox" id={`role-${role}`} name="roles" value={role} checked={props.selectedRoles?.includes(role)}
                                        onChange={() => props.handleRoleChange(role)}
                                    />
                                    <label htmlFor={`role-${role}`}>{role}</label><br />
                                </React.Fragment>
                            ))}
                        </div>

                        <div>
                            <input type="checkbox" id="IsActive" checked={props.isActive} onChange={(e) => props.setIsActive(e.target.checked)} />
                            <label className='form-label mb-0 mt-2 w-100'>Active User</label>
                            <input type="checkbox" id="IsTaskNotifications" checked={props.isTaskNotifications} onChange={(e) => props.setIsTaskNotifications(e.target.checked)} />
                            <label className='form-label mb-0 mt-2 w-100'>Task Notificattions</label>
                        </div>
                    </div>
                </div>

                {/* Image Information Tab */}
                <div
                    className="tab-pane fade"
                    id="imageInfo"
                    role="tabpanel"
                    aria-labelledby="image-info-tab"
                >
                    <div>
                        <ImagesC
                            EditdocumentsData={props.imageUrl}
                            setData={props.setImageUrl}
                            AllListId={props.TaskUserListId}
                            Context={props.context}
                            callBack={imageTabCallBack}
                        />
                    </div>
                </div>
                <DefaultButton className="btn btn-primary mt-3 p-3 shadow"
                    onClick={() => props.updateUser()}>Update</DefaultButton>
                <DefaultButton className="btn btn-primary mt-3 p-3 shadow"
                    onClick={() => props.setOpenUpdateMemberPopup(false)}>Cancel</DefaultButton>
            </div>
        </Panel>
    )
}

export default EditUserComponent