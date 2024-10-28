import * as React from 'react'
import { Web,sp } from "sp-pnp-js";
import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import GlobalCommanTable from '../../../globalComponents/GroupByReactTableComponents/GlobalCommanTable';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { ContextualMenu, IContextualMenuItem, Icon } from '@fluentui/react';
import ImagesC from "../../EditPopupFiles/ImageInformation";
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import VersionHistoryPopup from "../../../globalComponents/VersionHistroy/VersionHistory";
import "bootstrap/js/dist/tab";
import moment from 'moment';
import Tooltip from '../../../globalComponents/Tooltip';
import zIndex from '@material-ui/core/styles/zIndex';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import { FaChevronDown, FaChevronRight, FaMinusSquare, FaPlusSquare, FaSquare, FaCheckSquare } from 'react-icons/fa';
import { Col, Container, Row } from "react-bootstrap";
import { SPHttpClient } from "@microsoft/sp-http";
import { Avatar } from "@fluentui/react-components";


let EmailNotification: any

const TaskUserManagementTable = ({ TaskUsersListData, TaskGroupsListData, baseUrl, AllListid, TaskUserListId, context, fetchAPIData, smartMetaDataItems, teamOptions, companyOptions }: any) => {
    const [data, setData] = React.useState<any>([]);
    const [groupData, setGroupData] = useState([]);
    const [title, setTitle] = useState("");
    const [addTitle, setAddTitle] = useState<any>("");
    const [Email, setEmail] = useState<any>("");
    const [suffix, setSuffix] = useState("");
    const [selectedApprovalType, setSelectedApprovalType] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<any>([]);
    const [userGroup, setUserGroup] = useState("");
    const [userTeam, setUserTeam] = useState("");
    const [userCategory, setUserCategory] = useState("");
    const [imageUrl, setImageUrl] = useState<any>({});
    const [EditData, setEditData] = React.useState<any>({});
    const [isActive, setIsActive] = useState(false);
    const [isTaskNotifications, setIsTaskNotifications] = useState(false);
    const [assignedToUser, setAssignedToUser] = useState<any>([]);
    const [approver, setApprover] = useState([]);
    let [sortOrder, setSortOrder] = useState(null);
    const [openPopup, setOpenPopup] = useState(false);
    const [openGroupPopup, setOpenGroupPopup] = useState(false);
    const [openUpdateGroupPopup, setOpenUpdateGroupPopup] = useState(false);
    const [openUpdateMemberPopup, setOpenUpdateMemberPopup] = useState(false);
    const [itemToUpdate, setItemToUpdate] = useState(null);
    const [memberToUpdate, setMemberToUpdate] = useState(null);
    const [autoSuggestData, setAutoSuggestData] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [isUserNameValid, setIsUserNameValid] = useState(false);
    const [checked, setChecked] = useState([]);
    const [expanded, setExpanded] = useState([]);
    const [isSmartTime, setIsSmartTime] = useState(false)
    const [selectedApproval, setSelectedApproval] = useState('');
    // const [searchedProjectKey, setSearchedProjectKey] = React.useState("");

    const Categories: any = (smartMetaDataItems.filter((items: any) => items.TaxType === "TimesheetCategories"))
    const uniqueCategories = Categories.filter(
        (ele: any, i: any, item: any) => item.findIndex((elem: any) => (elem.Title === ele.Title) && elem.Parent?.Title === "Components") === i
    );
    // const categoriesToInclude:any = ["Design", "Development", "Investigation", "QA", "Support","Verification", "Coordination", "Implementation", "Conception", "Preparation"];
    // const uniqueCategories = Categories.filter((val: any) =>
    //     categoriesToInclude.includes(val.Title) && val.Parent?.Title === "Components"
    // );

    console.log(Categories)
    console.log(uniqueCategories)

    const TaxTypeCategories: any = (smartMetaDataItems.filter((items: any) => items.TaxType === "Categories"))
    const MyCategories = TaxTypeCategories.filter((items: any) => items.ParentID === 0)
    // When the member to update is set, initialize the Member states
    useEffect(() => {
        if (memberToUpdate) {
            if (memberToUpdate?.IsApprovalMail != null && memberToUpdate?.IsApprovalMail != undefined) {
                setSelectedApprovalType(memberToUpdate?.IsApprovalMail);
            }
            else {
                setSelectedApprovalType("Decide Case By Case")
            } setSelectedCompany(memberToUpdate?.Company);
            // setSelectedRoles(memberToUpdate.Role || []);
            setSelectedRoles(Array.isArray(memberToUpdate.Role) ? memberToUpdate.Role : []);
            setIsActive(memberToUpdate?.IsActive);
            setIsSmartTime(memberToUpdate?.isSmartTime)
            setIsTaskNotifications(memberToUpdate?.IsTaskNotifications);
            setUserCategory(memberToUpdate?.TimeCategory)
            // setSelectedCategories(JSON.parse(memberToUpdate.CategoriesItemsJson))
            if (memberToUpdate.CategoriesItemsJson) {
                const categoriesJson = memberToUpdate.CategoriesItemsJson != 'null' ? JSON.parse(memberToUpdate.CategoriesItemsJson) : [];
                setSelectedCategories(categoriesJson);
                if (categoriesJson) {
                    const categoryIds = categoriesJson.map((category: any) => category.Id.toString());
                    setChecked(categoryIds);
                }
            }
            setAssignedToUser(memberToUpdate?.AssingedToUser)
            // setApprover([memberToUpdate.Approver?.[0]?.Id])
            const Approvers: any = memberToUpdate?.Approver?.map((item: any) => item.Id)
            setApprover(Approvers)
            setUserTeam(memberToUpdate?.Team)
        }
    }, [memberToUpdate]);

    const handleApprovalTypeChange = (e: any) => {
        setSelectedApprovalType(e.target.value);
    };

    // Function to handle company selection
    const handleCompanyChange = (e: any) => {
        setSelectedCompany(e.target.value);
    };

    // Function to handle roles selection
    const handleRoleChange = (role: any) => {
        setSelectedRoles((prevSelectedRoles: any) =>
            prevSelectedRoles.includes(role)
                ? prevSelectedRoles.filter((r: any) => r !== role)
                : [...prevSelectedRoles, role]
        );
    };

    console.log(context)

    useEffect(() => {
        setData(TaskUsersListData);
        setGroupData(TaskGroupsListData);
    }, [TaskUsersListData, TaskGroupsListData]);

    const handleUpdateMemberClick = (item: any) => {
        setMemberToUpdate(item);
        setOpenUpdateMemberPopup(true);
        if (item.AssingedToUser) {
            setIsUserNameValid(true)
        }
    };

    const handleUpdateClick = (item: any) => {
        setItemToUpdate(item);
        setOpenUpdateGroupPopup(true);
    };

    const addTeamMember = async () => {
        let userId:any =[]
        let web = new Web(baseUrl);
        const externalUsers = await sp.web.siteUserInfoList.items.top(1000).get();
        console.log(externalUsers);
        externalUsers?.forEach((item:any)=>{
            if(item.UserName == addTitle[0]?.secondaryText){
                userId = item?.Id;
                setAssignedToUser(item)
            }
        })

        const taskUsers = await web.lists
        .getById(TaskUserListId)
        .items.filter(`AssingedToUser/Id eq '${userId}'`)
        .getAll();
    
        if(taskUsers != undefined && taskUsers.length > 0){
            alert('User already exist')
        }
        else{
            await web.lists.getById(TaskUserListId).items.add({
                Title: addTitle[0]?.text,
                AssingedToUserId:(userId != null && userId.length > 0) ? userId : null,
                Email:addTitle[0]?.secondaryText,
                ItemType: "User",
                Company:null,
                IsActive: false,
                IsTaskNotifications: false,
            }).then((res: any) => {
                console.log(res);
                const newItem = res.data;
                setData((prevData: any) => [...prevData, newItem]);
                setTitle("");
                setAddTitle("");
                setIsUserNameValid(true);
                setMemberToUpdate(newItem);
                setOpenUpdateMemberPopup(true);
                fetchAPIData()
                setAutoSuggestData(null)
                setOpenPopup(false);
            })
        }
       
    }

    const addNewGroup = async () => {
        let web = new Web(baseUrl);
        await web.lists.getById(TaskUserListId).items.add({
            Title: title,
            Suffix: suffix,
            SortOrder: sortOrder,
            ItemType: "Group",
            IsActive: true
        }).then((res: any) => {
            console.log(res);
            const newItem = res.data;
            setGroupData(prevData => [...prevData, newItem]);
            setTitle("");
            setSuffix("");
            setSortOrder("");
            fetchAPIData()
            setOpenGroupPopup(false);
        })
    }

    const deleteTeamMember = async (items: any) => {
        let web = new Web(baseUrl);
        var deleteAlert = confirm("Are you sure you want to delete this?")
        if (deleteAlert) {
            await web.lists.getById(TaskUserListId).items.getById(items?.Id).recycle()
                .then(i => {
                    console.log(i);
                    setData((prevData: any) => prevData.filter((item: any) => item.Id !== items?.Id));
                    setGroupData(prevData => prevData.filter(item => item.Id !== items?.Id));
                    fetchAPIData()
                    setOpenUpdateMemberPopup(false)
                });
        }
    }

    const updateUser = async () => {
        let sortOrderValue = sortOrder !== undefined ? (sortOrder == "" ? sortOrder = null : sortOrder) : memberToUpdate.SortOrder
        // let sortOrderValue = sortOrder !== undefined ? sortOrder : memberToUpdate.SortOrder
        let web = new Web(baseUrl);
        if (memberToUpdate) {
            const updatedData = {
                Title: title ? title : memberToUpdate.Title,
                Suffix: suffix != '' ? suffix : memberToUpdate.Suffix,
                SortOrder: sortOrderValue,
                IsActive: isActive,
                Company: selectedCompany,
                TimeCategory: userCategory ? userCategory : memberToUpdate.userCategory,
                IsApprovalMail: selectedApprovalType ? selectedApprovalType : memberToUpdate.IsApprovalMail,
                // SortOrder: (sortOrder !== undefined && sortOrder !== null) ? sortOrder : memberToUpdate.SortOrder,
                Role: { "results": selectedRoles },
                IsTaskNotifications: isTaskNotifications,
                AssingedToUserId:
                    assignedToUser != null ? assignedToUser?.Id : null,
                // ApproverId: Array.isArray(approver) && approver.every(item => typeof item === 'number' && item != null)
                //     ? { "results": approver } : (approver.length > 0 && approver[0] != null && approver[0].AssingedToUser?.Id != null) ? { "results": [approver[0].AssingedToUser.Id] } : { "results": [] },
                ApproverId: Array.isArray(approver) && approver.every(item => typeof item === 'number' && item != null)
                    ? { "results": approver } : Array.isArray(approver) && approver.length > 0 ? { "results": approver?.map(app => app?.userId) } : { "results": [] },
                // ApproverId: Array.isArray(approver) && approver.length > 0 ? { "results": approver?.map(app => app?.AssingedToUser?.Id) } : { "results": [] },
                UserGroupId: userGroup ? parseInt(userGroup) : memberToUpdate?.UserGroup?.Id,
                Team: userTeam ? userTeam : memberToUpdate.Team,
                // Item_x0020_Cover: { "__metadata": { type: "SP.FieldUrlValue" }, Description: "Description", Url: imageUrl?.Item_x002d_Image != undefined ? imageUrl?.Item_x002d_Image?.Url : (imageUrl?.Item_x0020_Cover != undefined ? imageUrl?.Item_x0020_Cover?.Url : null) },
                // Item_x0020_Cover: { "__metadata": { type: "SP.FieldUrlValue" }, Description: "Description", Url: imageUrl?.Item_x0020_Cover != undefined ? imageUrl?.Item_x0020_Cover?.Url : memberToUpdate.Item_x0020_Cover.Url},
                Item_x0020_Cover: { "__metadata": { type: "SP.FieldUrlValue" }, Description: "Description", Url: imageUrl?.Item_x002d_Image?.Url || imageUrl?.Item_x0020_Cover?.Url || (memberToUpdate?.Item_x0020_Cover?.Url || null) },
                CategoriesItemsJson: JSON.stringify(selectedCategories),
                Email: Email ? Email:memberToUpdate?.Email,
                isSmartTime: isSmartTime
            };

            await web.lists.getById(TaskUserListId).items.getById(memberToUpdate.Id).update(updatedData).then((res: any) => {
                console.log('Updated Data:', updatedData);

                // Update the data and groupData states
                const updatedMemberData = data.map((item: any) => {
                    if (item.Id === memberToUpdate.Id) {
                        return { ...item, ...updatedData };
                    }
                    return item;
                });

                setData(updatedMemberData);
                setSortOrder("")
                setMemberToUpdate({})
                setUserCategory("")
                setUserTeam("")
                setSelectedApprovalType('')
                setIsTaskNotifications(false)
                setSelectedCategories([])
                setImageUrl({})
                setTitle("")
                setSelectedRoles([])
                setApprover([])
                setUserGroup("")
                setSelectedCompany('')
                setIsActive(false)
                setIsSmartTime(false)
                setAssignedToUser([])
                setSuffix("")
                setOpenUpdateMemberPopup(false);
                EmailNotification = ""
                fetchAPIData()
            }).catch(error => {
                console.error("Error updating item: ", error);
            });
        }
    };

    const updateGroup = async () => {
        let web = new Web(baseUrl);
        if (itemToUpdate) {
            await web.lists.getById(TaskUserListId).items.getById(itemToUpdate.Id).update({
                Title: title ? title : itemToUpdate.Title,
                Suffix: suffix ? suffix : itemToUpdate.Suffix,
                SortOrder: sortOrder ? sortOrder : itemToUpdate.SortOrder,
            }).then((res: any) => {
                console.log(res);
                setGroupData(prevData => prevData.map(item => {
                    if (item.Id === itemToUpdate.Id) {
                        return {
                            ...item,
                            Title: title ? title : item.Title,
                            Suffix: suffix ? suffix : item.Suffix,
                            SortOrder: sortOrder ? sortOrder : item.SortOrder,
                        };
                    }
                    return item;
                }));
                fetchAPIData()
                setOpenUpdateGroupPopup(false);
            }).catch(error => {
                console.error("Error updating item: ", error);
            });
        }
    }

    // Table for User code

    const columns = React.useMemo<ColumnDef<any, unknown>[]>(
    () => [
      {
        accessorFn: "",
        canSort: false,
        placeholder: "",
        header: "",
        id: "row.original",
        size: 10,
      },
      {
        accessorKey: "Title",
        header: "",
        placeholder: "Search Name",
        id: "Title",
        cell: ({ row }: any) => (
          <div style={{ display: "flex", alignItems: "center" }}>
                       
                            <Avatar
                                className="UserImage"
                                title={row.original?.AssingedToUser?.Title}
                                name={row.original?.AssingedToUser?.Title}
                                image={ row?.original?.Item_x0020_Cover!=undefined?{src: row?.original?.Item_x0020_Cover?.Url,
                                      }:undefined}
                                initials={row?.original?.Item_x0020_Cover==undefined ?row.original?.Suffix:undefined}
                                
                            />
                       

            <span>{`${row.original.Title} (${row.original.Suffix})`}</span>
          </div>
        ),
        sortDescFirst: false,
      },
      {
        accessorFn: (row) => row?.UserGroupTitle,
        header: "",
        id: "UserGroupTitle",
        placeholder: "Search Group",
      },
      {
        accessorFn: (row) => row?.TimeCategory,
        header: "",
        id: "TimeCategory",
        placeholder: "Search Category",
        size: 80,
      },
      {
        accessorFn: (row) => row?.SortOrder,
        header: "",
        id: "SortOrder",
        placeholder: "Sort Order",
        size: 42,  
        filterFn: (row: any, columnId: any, filterValue: any) => {
          return row?.original?.SortOrder == filterValue;
        },
      },
      {
        accessorFn: (row) => row?.RoleTitle,
        header: "",
        id: "RoleTitle",
        placeholder: "Roles",
      },
      {
        accessorFn: (row) => row?.Company,
        header: "",
        id: "Company",
        placeholder: "Company",
        size: 70,
      },
      {
        accessorFn: (row) => row?.ApproverTitle,
        header: "",
        id: "ApproverTitle",
        placeholder: "Approver",
      },
      {
        accessorFn: (row) => row?.Team,
        header: "",
        id: "Team",
        placeholder: "Team",
        size: 75,
      },
      {
        id: "TaskId",
        accessorKey: "TaskId",
        header: null,
        size: 50,
        cell: (info) => (
          <div className="pull-right alignCenter">
            <span
              onClick={() => handleUpdateMemberClick(info.row.original)}
              className="svg__iconbox svg__icon--edit"
              title="Edit"
            ></span>
          </div>
        ),
        enableColumnFilter: false,
        enableSorting: false,
      },
    ],
    [data]
  );

    // Table for Group code

    const columns2 = React.useMemo<ColumnDef<any, unknown>[]>(
        () => [
            {
                accessorKey: 'Title',
                id: "Title",
                header: "",
                placeholder: "Title",
                // sortDescFirst: false
            },
            {
                accessorKey: "SortOrder",
                header: "",
                placeholder: "Sort Order",
                id: "SortOrder",
                isColumnDefultSortingDesc: true,
                filterFn: (row: any, columnId: any, filterValue: any) => {
                    return row?.original?.SortOrder == filterValue
                },
            },
            {
                cell: (info) => (<div className='pull-right alignCenter'>
                    <span onClick={() => handleUpdateClick(info.row.original)} className='svg__iconbox svg__icon--edit' title='Edit'></span>
                    <span onClick={() => deleteTeamMember(info.row.original)} className='svg__iconbox svg__icon--trash' title='Trash'></span>
                </div>),
                id: "editIcon",
                canSort: false,
                placeholder: "",
                size: 30,
            }
        ],
        [groupData]
    )

    const userIdentifier = memberToUpdate?.AssingedToUser?.Name;
    const email = userIdentifier ? userIdentifier.split('|').pop() : '';

    const userIdentifiers = memberToUpdate?.Approver?.map((approver: any) => approver.Name) || [];
    const emails = userIdentifiers.map((identifier: any) => identifier.split('|').pop());

    const callBackData = React.useCallback((elem: any, ShowingData: any) => {

    }, []);

    const imageTabCallBack = React.useCallback((data: any) => {
        setEditData(data);
        console.log(EditData);
        console.log(data);
    }, []);

    const getUserInfo = async (userMail: string) => {
        const userEndPoint: any = `${context?.pageContext?.web?.absoluteUrl}/_api/Web/EnsureUser`;

        const userData: string = JSON.stringify({
            logonName: userMail,
        });

        const userReqData = {
            body: userData,
        };

        const resUserInfo = await context?.spHttpClient.post(
            userEndPoint,
            SPHttpClient.configurations.v1,
            userReqData
        );
        const userInfo = await resUserInfo.json();

        return userInfo;
    };

    const AssignedToUser = async (items: any[]) => {
        let userId: number = undefined;
        let userTitle: any;
        let userSuffix: string = undefined;
        if (items.length > 0) {
            let userMail = items[0].id.split("|")[2];
            EmailNotification = userMail
            let userInfo = await getUserInfo(userMail);
            userId = userInfo.Id;
            userTitle = userInfo.Title;
            userSuffix = userTitle
                .split(" ")
                .map((i: any) => i.charAt(0))
                .join("");
            setAssignedToUser(userInfo);
            setIsUserNameValid(true);
        } else {
            setAssignedToUser([]);
            setIsUserNameValid(false);
        }
    };

    const ApproverFunction = async (items: any[]) => {
        let userId: number = undefined;
        let userTitle: any;
        let userSuffix: string = undefined;
        let userMail: any
        let userInfo: any
        if (items.length > 0) {
            const approvers = await Promise.all(items.map(async (selectedusers) => {
                userMail = selectedusers?.id.split("|")[2];
                userInfo = await getUserInfo(userMail);
                userId = userInfo.Id;
                userTitle = userInfo.Title;
                userSuffix = userTitle
                    .split(" ")
                    .map((i: any) => i.charAt(0))
                    .join("");

                return {
                    userId: userId,
                    userTitle: userTitle,
                    userSuffix: userSuffix
                };
            }));
            setApprover(approvers);
        } else {
            setApprover([]);
        }
    };

    // Autosuggestion code

    const autoSuggestionsForTitle = (e: any) => {
        let SearchedKeyWord: any = e.target.value;
        let TempArray: any = [];
        if (SearchedKeyWord.length > 0) {
            if (data != undefined && data?.length > 0) {
                data.map((AllDataItem: any) => {
                    if (
                        AllDataItem?.Title?.toLowerCase()?.includes(
                            SearchedKeyWord.toLowerCase()
                        )
                    ) {
                        TempArray.push(AllDataItem);
                    }
                });
            }
            if (TempArray != undefined && TempArray.length > 0) {
                setAutoSuggestData(TempArray);
            }
        } else {
            setAutoSuggestData([]);
        }
    };

    // Approval type column - Approve Selected code starts here

    const buildHierarchy = (categories: any) => {
        const rootCategories = categories.filter((c: any) => c.ParentID === 0);
        const findChildren = (parent: any) => {
            const children = categories.filter((c: any) => c.ParentID === parent.ID);
            if (children.length > 0) {
                parent.children = children.map((child: any) => findChildren(child));
            }
            return parent;
        };
        return rootCategories.map((rootCategory: any) => findChildren(rootCategory));
    };

    useEffect(() => {
        buildHierarchy(TaxTypeCategories);
    }, [TaxTypeCategories])

    // Headers for Panel customisation code

    const onRenderCustomHeaderUpdateUser = () => {
        return (
            <>
                <div className='siteColor subheading'> Task-User Management - {memberToUpdate?.Title} </div>
                <Tooltip ComponentId='1767' />
            </>
        );
    };

    const onRenderCustomHeaderUpdateGroup = () => {
        return (
            <>
                <div className='siteColor subheading'> Update Group </div>
                <Tooltip ComponentId='1768' />
            </>
        );
    };

    const onRenderCustomHeaderAddGroup = () => {
        return (
            <>
                <div className='siteColor subheading'> Add Group </div>
                <Tooltip ComponentId='1757' />
            </>
        );
    };

    const onRenderCustomHeaderAddUser = () => {
        return (
            <>
                <div className='siteColor subheading'> Add User </div>
                <Tooltip ComponentId='1757' />
            </>
        );
    };

    const cancelAdd = () => {
        setAddTitle("")
        setAutoSuggestData(null)
        setOpenPopup(false)
    }

    const cancelUpdate = () => {
        setSelectedApprovalType(memberToUpdate.IsApprovalMail);
        setSelectedCompany(memberToUpdate.Company);
        setSelectedRoles(Array.isArray(memberToUpdate.Role) ? memberToUpdate.Role : []);
        setIsActive(memberToUpdate.IsActive);
        setIsSmartTime(memberToUpdate.isSmartTime)
        setIsTaskNotifications(memberToUpdate.IsTaskNotifications);
        setUserCategory(memberToUpdate.TimeCategory)
        setSelectedCategories(JSON.parse(memberToUpdate.CategoriesItemsJson))
        const Approvers: any = memberToUpdate?.Approver?.map((item: any) => item.Id)
        setApprover([Approvers])
        setUserTeam(memberToUpdate.Team)
        setOpenUpdateMemberPopup(false)
    }

    const findCategoryById = (categories: any, id: any): any => {
        for (const category of categories) {
            if (category.Id.toString() === id) {
                return category;
            }
            if (category.children) {
                const result = findCategoryById(category.children, id);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    };

    const handleCheck = (checked: any) => {
        setChecked(checked);
        const selected = checked.map((id: any) => {
            const category = findCategoryById(MyCategories, id);
            return category ? { Title: category.Title, Id: category.Id } : null;
        }).filter((cat: any) => cat !== null);
        setSelectedCategories(selected);
    };

    const transformCategoriesToNodes = (categories: any) => {
        return categories.map((category: any) => {
            // Check if the category has children
            const hasChildren = category.children && category.children.length > 0;
            const node: any = {
                value: category.Id.toString(),
                label: category.Title,
            };
            // Conditionally add the 'children' property if the category has children
            if (hasChildren) {
                node.children = transformCategoriesToNodes(category.children);
            }
            return node;
        });
    };

    const icons: any = {
        check: <FaCheckSquare />,
        uncheck: <span className="alignIcon svg__iconbox svg__icon--sqCheckbox" />,
        halfCheck: <span className="alignIcon svg__iconbox svg__icon--dotCheckbox" />,
        expandClose: <span className="alignIcon svg__iconbox svg__icon--arrowRight" />,
        expandOpen: <span className='alignIcon svg__iconbox svg__icon--arrowDown' />,
        parentClose: <span className='alignIcon svg__iconbox svg__icon--arrowRight' />,
        parentOpen: <span className='alignIcon svg__iconbox svg__icon--arrowDown' />,
        leaf: null
    };



    const getPeoplePickerItems=(items:any)=>{
          setAddTitle(items)
    }
    // JSX Code starts here

    return (
        <>
            <ul className="fixed-Header nav nav-tabs" id="myTab" role="tablist">
                <button className="nav-link active" id="TEAM-MEMBERS" data-bs-toggle="tab" data-bs-target="#TEAMMEMBERS"
                    type="button"
                    role="tab"
                    aria-controls="TEAMMEMBERS"
                    aria-selected="true"
                >
                    TEAM MEMBERS
                </button>
                <button className="nav-link" id="TEAM-GROUPS" data-bs-toggle="tab" data-bs-target="#TEAMGROUPS"
                    type="button"
                    role="tab"
                    aria-controls="TEAMGROUPS"
                    aria-selected="true"
                >
                    TEAM GROUPS
                </button>
            </ul >

            <div className="border border-top-0 clearfix p-1 tab-content" id="myTabContent">
                {/* <div className="tab-pane fade show active" id="team-members" role="tabpanel" aria-labelledby="teammemberstab"> */}
                <div className="tab-pane show active" id="TEAMMEMBERS" role="tabpanel" aria-labelledby="TEAMMEMBERS">
                    <div className='Alltable'>
                        <div className='tbl-button'>
                            <button type='button' className='btn btn-primary position-relative' style={{ zIndex: "99" }} onClick={() => setOpenPopup(true)}>Add Team Member</button>
                        </div>
                        <GlobalCommanTable columns={columns} data={data} callBackData={callBackData} showHeader={true} hideOpenNewTableIcon={true} hideTeamIcon={true} />
                    </div>
                </div>
                <div className="tab-pane" id="TEAMGROUPS" role="tabpanel" aria-labelledby="TEAMGROUPS">

                    <div className='Alltable'>

                        <div className='tbl-button'>
                            <button type='button' className='btn btn-primary position-relative' style={{ zIndex: "99" }} onClick={() => setOpenGroupPopup(true)}>Add Team Group</button>
                        </div>
                        <GlobalCommanTable columns={columns2} data={groupData} callBackData={callBackData} showHeader={true} hideOpenNewTableIcon={true} hideTeamIcon={true} />
                    </div>
                </div>
            </div>

{/* ------------------Add Team Member----------------------------------------------------------------------------------- */}
            <Panel
                onRenderHeader={onRenderCustomHeaderAddUser}
                isOpen={openPopup}
                onDismiss={cancelAdd}
                isFooterAtBottom={true}
                isBlocking={!openPopup}
            >
                <div className="modal-body">
                  
                        <div>
                            <ul className="list-group">
                                {/* {autoSuggestData?.map((Item: any) => {
                                    return (
                                        <li
                                            className="hreflink list-group-item rounded-0 list-group-item-action"
                                            key={Item.id}
                                        >
                                            <a>{Item.Title}</a>
                                        </li>
                                    );
                                })} */}
                                <div>
                                    <PeoplePicker
                                        context={context}
                                        principalTypes={[PrincipalType.User]}
                                        personSelectionLimit={1}
                                        titleText="Select People"
                                        resolveDelay={1000}
                                        onChange={getPeoplePickerItems}
                                        showtooltip={true}
                                        required={true}
                                        disabled={false}
                                    ></PeoplePicker>
                                </div>
                            </ul>
                        </div>
                  
                </div>

                <footer className='modal-footer mt-2'>
                    <button type='button' disabled={addTitle==''?true:false} className='btn me-2 btn-primary' onClick={() => addTeamMember()}>Save</button>
                    <button type='button' className='btn btn-default' onClick={cancelAdd}>Cancel</button>
                </footer>

            </Panel>


            <Panel
                onRenderHeader={onRenderCustomHeaderAddGroup}
                isOpen={openGroupPopup}
                onDismiss={() => setOpenGroupPopup(false)}
                isFooterAtBottom={true}
                isBlocking={!openGroupPopup}
            >
                <div className="modal-body">
                    <div className='input-group'>
                        <label className='form-label full-width'>Title: </label>
                        <input className='form-control' type="text" value={title} onChange={(e: any) => setTitle(e.target.value)} />
                    </div>
                    <div className='input-group my-2'>
                        <label className='form-label full-width'>Suffix: </label>
                        <input className='form-control' type="text" value={suffix} onChange={(e: any) => setSuffix(e.target.value)} />
                    </div>
                    <div className='input-group'>
                        <label className='form-label full-width'>Sort Order: </label>
                        <input className='form-control' type="text" value={sortOrder} onChange={(e: any) => setSortOrder(e.target.value)} />
                    </div>
                </div>
                <footer className='modal-footer mt-2'>
                    <button type='button' className='btn me-2 btn-primary' onClick={() => addNewGroup()}>Save</button>
                    <button type='button' className='btn btn-default' onClick={() => setOpenGroupPopup(false)}>Cancel</button>
                </footer>
            </Panel>
            <Panel
                onRenderHeader={onRenderCustomHeaderUpdateGroup}
                isOpen={openUpdateGroupPopup}
                onDismiss={() => setOpenUpdateGroupPopup(false)}
                isFooterAtBottom={true}
                isBlocking={!openUpdateGroupPopup}
            >
                <div className='modal-body'>
                    <div className="add-datapanel">
                        <div className='input-group'>
                            <label className='form-label full-width fw-semibold'>Title: </label>
                            <input className='form-control' type="text" defaultValue={itemToUpdate?.Title} onChange={(e: any) => setTitle(e.target.value)} />
                        </div>
                        <div className='input-group'>
                            <label className='form-label full-width fw-semibold'>Suffix: </label>
                            <input className='form-control' type="text" defaultValue={itemToUpdate?.Suffix} onChange={(e: any) => setSuffix(e.target.value)} />
                        </div>
                        <div className='input-group'>
                            <label className='form-label full-width fw-semibold'>Sort Order: </label>
                            <input className='form-control' type="text" defaultValue={itemToUpdate?.SortOrder} onChange={(e: any) => setSortOrder(e.target.value)} />
                        </div>
                    </div>
                </div>
                <footer className='modal-footer mt-2'>
                    <button type='button' onClick={() => updateGroup()} className='btn me-2 btn-primary'>Update</button>
                    <button type='button' onClick={() => setOpenUpdateGroupPopup(false)} className='btn btn-default'>Cancel</button>
                </footer>
            </Panel>
            <Panel
                onRenderHeader={onRenderCustomHeaderUpdateUser}
                type={PanelType.large}
                isOpen={openUpdateMemberPopup}
                onDismiss={cancelUpdate}
                isFooterAtBottom={true}
                isBlocking={!openUpdateMemberPopup}
            >
                <div className='modal-body mb-5'>
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

                    <div className="tab-content p-3 task-user-mangement" id="myTabContent">
                        {/* Basic Information Tab */}
                        <div
                            className="tab-pane fade show active"
                            id="basicInfo"
                            role="tabpanel"
                            aria-labelledby="basic-info-tab"
                        >
                            <Row className='mb-2'>
                                <Col md={6} className='ps-3'>
                                    <Row>
                                        <Col md={5} sm={5} className='px-1 ps-0'>
                                            <div className='input-group'>
                                                <label className='form-label full-width fw-semibold'>Title: </label>
                                                <input className='form-control' type="text" defaultValue={memberToUpdate?.Title} onChange={(e: any) => setTitle(e.target.value)} />
                                            </div>
                                        </Col>

                                        <Col md={2} sm={2}>
                                            <div className='input-group'>
                                                <label className='form-label full-width fw-semibold'>Suffix: </label>
                                                <input className='form-control' type="text" defaultValue={memberToUpdate?.Suffix} onChange={(e: any) => setSuffix(e.target.value)} />
                                            </div>
                                        </Col>

                                        <Col md={5} className='px-1'>
                                            <div className='input-group'>
                                                <label className='form-label full-width fw-semibold'>Group: </label>
                                                <select className='full-width' id="sites" defaultValue={memberToUpdate?.UserGroup?.Id} onChange={(e: any) => setUserGroup(e.target.value)}>
                                                    <option>Select</option>
                                                    {TaskGroupsListData.map((elem: any) => <option value={elem?.Id}>{elem?.Title}</option>)}
                                                </select>
                                            </div>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col md={6} >
                                    <Row>
                                        <Col md={2} sm={2}>
                                            <div className='input-group'>
                                                <label className='form-label full-width fw-semibold'>Sort Order: </label>
                                                <input className='form-control' type="text" defaultValue={memberToUpdate?.SortOrder} onChange={(e: any) => setSortOrder(e.target.value)} />
                                            </div>
                                        </Col>

                                        <Col md={5} sm={5} className=' px-1'>
                                            <div className='input-group'>
                                                <label className='form-label full-width fw-semibold'>Manage Categories: </label>
                                                <select className='full-width' id="sites" defaultValue={memberToUpdate?.TimeCategory} onChange={(e: any) => setUserCategory(e.target.value)}>
                                                    <option>Select</option>
                                                    {uniqueCategories.map((elem: any) => <option value={elem.Title}>{elem.Title}</option>)}
                                                </select>
                                            </div></Col>
                                        <Col md={5} sm={5} className='ps-1 pe-1'>
                                            <div className='input-group'>
                                                <label className='form-label full-width fw-semibold'>Team: </label>
                                                <select className='full-width' id="sites" defaultValue={memberToUpdate?.Team} onChange={(e: any) => setUserTeam(e.target.value)}
                                                >
                                                    <option>Select</option>
                                                    {teamOptions?.map((team: any) => (
                                                    <option value={team?.key}>{team?.key}</option>
                                                    ))}
                                                </select> 
                                            </div>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className='mt-2'>
                                <Col className='pe-0 ps-1'>
                                    <div className='input-group class-input'>
                                        <label className='form-label full-width fw-semibold'>MS Teams ID:</label>
                                        <div className="w-100">
                                            <PeoplePicker context={context} titleText="" personSelectionLimit={1} showHiddenInUI={false}
                                                principalTypes={[PrincipalType.User]} resolveDelay={1000} onChange={(items) => AssignedToUser(items)}
                                                defaultSelectedUsers={email ? [email] : []} />
                                        </div>
                                    </div>
                                </Col>
                                <Col className='ps-2'>
                                    <div className='input-group class-input'>
                                        <label className='form-label full-width fw-semibold'>Approver:</label>
                                        <div className="w-100">
                                            <PeoplePicker context={context} titleText=""
                                                personSelectionLimit={4} showHiddenInUI={false} principalTypes=
                                                {[PrincipalType.User]} resolveDelay={1000} onChange={(items) => ApproverFunction(items)}
                                                defaultSelectedUsers={emails.length > 0 ? emails : []} />
                                        </div>
                                    </div>
                                </Col>
                                <Col>
                                <div className='input-group'>
                                                <label className='form-label full-width fw-semibold'>Email: </label>
                                                <input className='form-control' type="text" defaultValue={memberToUpdate?.Email} onChange={(e: any) => setEmail(e.target.value)} />
                                            </div>
                                </Col>
                            </Row>


                            <Row className='mb-2 mt-2'>
                                <Col md={2}>
                                    <div className='input-group'>
                                        <label className='form-label full-width fw-semibold'>Company: </label>
                                        <Col>
                                        {companyOptions?.map((company: any) => (
                                            <div className="mb-1">
                                                <label className="SpfxCheckRadio">
                                                    <input
                                                    className="radio"
                                                    type="radio"
                                                    id={company.key}
                                                    name="company"
                                                    value={company.key}
                                                    checked={selectedCompany === company.key}
                                                    onChange={handleCompanyChange}
                                                    />
                                                    {company?.key}
                                                </label>
                                            </div>
                                        ))} 
                                        </Col>
                                    </div>
                                </Col>
                                <Col md={4} className='px-1'>
                                    <div className='input-group'>
                                        <label className='form-label full-width fw-semibold'>Roles: </label>
                                        <Row>
                                            <Col className='px-0' style={{ width: '165px' }}>
                                                {['Component Teams', 'Service Teams'].map((role: any) => (
                                                    <React.Fragment key={role}>
                                                        <label className='SpfxCheckRadio mb-1' htmlFor={`role-${role}`}>
                                                            <input type="checkbox" className='form-check-input me-1' id={`role-${role}`} name="roles" value={role} checked={selectedRoles?.includes(role)}
                                                                onChange={() => handleRoleChange(role)}
                                                            />
                                                            {role}</label>
                                                    </React.Fragment>
                                                ))}
                                            </Col>
                                            <Col>
                                                <div>
                                                    <label className='SpfxCheckRadio mb-1'>
                                                        <input type="checkbox" className='form-check-input me-1' id="IsActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                                                        Active User</label>
                                                </div>
                                                <div>
                                                    <label className='SpfxCheckRadio'>
                                                        <input type="checkbox" className='form-check-input me-1' id="IsTaskNotifications" checked={isTaskNotifications} onChange={(e) => setIsTaskNotifications(e.target.checked)} />
                                                        Task Notifications</label>
                                                </div>

                                            </Col>

                                        </Row>

                                    </div>
                                </Col>
                                <Col md={4} className='mt-4'>
                                <Row>
                                <div>
                                    <label className='SpfxCheckRadio'>
                                      <input type="checkbox" className='form-check-input me-1' id="isSmartTime" checked={isSmartTime} onChange={(e) => setIsSmartTime(e.target.checked)} />
                                         Smart Time</label>
                                  </div>
                                </Row>  
                                </Col>
                            </Row>
                            <Row>
                                <label className='form-label full-width fw-semibold'>Approval Type: </label>
                                <Row>
                                    <div className='mb-1'>
                                        <label className='SpfxCheckRadio' htmlFor="approveAll">
                                            <input type="radio" id="Approve All" className='radio' name="approvalType" value="Approve All" checked={selectedApprovalType === 'Approve All'} onChange={handleApprovalTypeChange} />
                                            Approve All</label>
                                    </div>
                                    <div className='mb-1'>
                                        <label className='SpfxCheckRadio' htmlFor="caseByCase">
                                            <input type="radio" id="Decide Case By Case" className='radio' name="approvalType" value="Decide Case By Case" checked={selectedApprovalType === 'Decide Case By Case'} onChange={handleApprovalTypeChange} />
                                            Case by Case</label>

                                    </div>
                                    <Row className='mb-2'>
                                        <label className='SpfxCheckRadio' htmlFor="approveSelected">
                                            <input type="radio" id="Approve Selected" className='radio' name="approvalType" value="Approve Selected" checked={selectedApprovalType === 'Approve Selected'} onChange={handleApprovalTypeChange} />
                                            Approve Selected</label>
                                        {selectedApprovalType === "Approve Selected" ?
                                            <>
                                                <div className="approvelSelected">
                                                    <CheckboxTree
                                                        nodes={transformCategoriesToNodes(MyCategories)}
                                                        checked={checked}
                                                        expanded={expanded}
                                                        onCheck={handleCheck}
                                                        onExpand={setExpanded}
                                                        icons={icons}
                                                        showNodeIcon={false}
                                                        showExpandAll={false}
                                                    />
                                                </div>
                                            </>
                                            : ""}
                                    </Row>

                                </Row>
                            </Row>
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
                                    EditdocumentsData={memberToUpdate}
                                    setData={setMemberToUpdate}
                                    AllListId={TaskUserListId}
                                    Context={context}
                                    callBack={imageTabCallBack}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <footer
                    className="bg-f4 fixed-bottom"
                    style={{ position: "absolute" }}>
                    <div className="align-items-center d-flex justify-content-between px-4 py-2">
                        <div>
                            <div className="text-left">
                                Created{" "}
                                <span ng-bind="memberToUpdate?.Created | date:'MM-DD-YYYY'">
                                    {" "}
                                    {memberToUpdate?.Created ? moment(memberToUpdate?.Created).format("DD MMM YYYY") : ""}
                                </span>{" "}
                                by
                                <span className="panel-title ps-1">
                                    {memberToUpdate?.Author?.Title != undefined
                                        ? memberToUpdate?.Author?.Title
                                        : ""}
                                </span>
                            </div>
                            <div className="text-left">
                                Last modified{" "}
                                <span>
                                    {memberToUpdate?.Modified ? moment(memberToUpdate?.Modified).format("DD MMM YYYY") : ''}
                                </span>{" "}
                                by{" "}
                                <span className="panel-title">
                                    {memberToUpdate?.Editor?.Title != undefined
                                        ? memberToUpdate?.Editor.Title
                                        : ""}
                                </span>
                            </div>
                            <div className="text-left">
                                <a onClick={() => deleteTeamMember(memberToUpdate)}>
                                    <span style={{ marginLeft: '-4px' }} className="alignIcon svg__iconbox hreflink mini svg__icon--trash"></span>{" "}
                                    Delete This Item
                                </a>
                                <span> | </span>
                                <span>
                                    {" "}
                                    {memberToUpdate?.ID ? (
                                        <VersionHistoryPopup
                                            taskId={memberToUpdate?.ID}
                                            listId={TaskUserListId}
                                            siteUrls={baseUrl}
                                            RequiredListIds={AllListid}
                                        />
                                    ) : (
                                        ""
                                    )}
                                </span>
                            </div>
                        </div>
                        <div>
                            <div className="footer-right">
                                <a
                                    className="p-1"
                                    href={`${baseUrl}/Lists/Task%20Users/DispForm.aspx?ID=${memberToUpdate?.Id}`}
                                    target="_blank"
                                    data-interception="off"
                                >
                                    Open Out-of-The-Box Form
                                </a>
                                <button
                                    type="button"
                                    className="btn btn-primary ms-2 px-4"
                                    onClick={() => updateUser()}
                                    disabled={!isUserNameValid}
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-default btn-default ms-1"
                                    onClick={cancelUpdate}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </footer>
            </Panel >
        </>
    )
}

export default TaskUserManagementTable;
