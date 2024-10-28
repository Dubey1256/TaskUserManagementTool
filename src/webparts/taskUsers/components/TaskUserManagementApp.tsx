import { useEffect, useState } from 'react';
import * as React from 'react';
import { Web } from "sp-pnp-js";
import { Panel, PrimaryButton } from '@fluentui/react';
import GlobalCommanTable from './TaskUserManagementTable';
//import GlobalCommanTable from './GlobalCommanTable2';
import { ColumnDef } from '@tanstack/react-table';
import './Style.css';
// import * as moment from 'moment';

const baseURL = "https://smalsusinfolabs.sharepoint.com/sites/Portal/Adarsh"
const listId = "AA3411E9-0D7E-4F52-A30F-165FD76FDFF2"
export default function MyComponent() {
    const [listItems, setListItems] = useState([]);
    const [time, setTime] = useState(() => new Date());
    const [updateVal, setUpdateVal] = useState<any>({});
    const [colName, setData] = useState<any>({ 'Id': '', 'Title': '', 'Name': '', 'Address': '', 'MobileNo': '', 'DOB': '', 'Skills': '', 'TestLookup': '', 'Hobbies': [] });
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [lookuplistitems, setLookupListItems] = useState<any>([]);

    useEffect(() => {
        const clock = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(clock)

    }, [])

    useEffect(() => {
        getListData();
        getLookupListData();
    }, []);

    const openAddPanel = () => {
        setIsAddOpen(true)//
    }
    // function for closing add panel
    const closeAddPanel = () => {
        setIsAddOpen(false)
    }

    // function for opening update panel
    const openUpdatePanel = () => {
        setIsUpdateOpen(true)
    }

    // function for closing update panel
    const closeUpdatePanel = () => {
        setIsUpdateOpen(false)
    }
    const getListData = () => {
        const web = new Web(baseURL);
        web.lists.getById(listId).items.select('Id', 'Title', 'Name', 'Address', 'MobileNo', 'DOB', 'Skills', 'TestLookup/Id', 'TestLookup/Title', 'Hobbies/Id', 'Hobbies/Hobbies').expand('TestLookup', 'Hobbies').get().then((response: any) => {
            setListItems(response);
        }).catch((error: any) => {
            console.error(error);
        });
    };

    const getLookupListData = () => {
        const web = new Web(baseURL);
        web.lists.getById("75BFD2EE-0FFF-46CD-AE25-C7F78D7A40E3").items.select('Id', 'Title', 'Hobbies').get().then((response: any) => {
            setLookupListItems(response);
        }).catch((error) => {
            console.log(error);
        });
    };


    const updateHandler = (param: any) => {
        openUpdatePanel()
        setUpdateVal(param);
        setData({
            Title: param.Title,
            Name: param.Name,
            Address: param.Address,
            MobileNo: param.MobileNo,
            DOB: param.DOB,
            Skills: param.Skills,
            TestLookup: param.TestLookup,
            Hobbies: param.Hobbies
        });
        // rerender();

    };


    const AddData = () => {
        const newValue = {
            Title: colName.Title,
            Name: colName.Name,
            Address: colName.Address,
            MobileNo: colName.MobileNo,
            DOB: colName.DOB,
            Skills: colName.Skills,
            TestLookupId:  colName.TestLookup,
            HobbiesId: colName.Hobbies,
        };

        const confirmAdd = window.confirm("Are you sure you want to add the item?");

        if (confirmAdd) {
            const web = new Web(baseURL);
            web.lists.getById(listId).items.add(newValue).then((response: any) => {
                alert("Item Added Successfully");
                closeAddPanel();
                getListData();
                getLookupListData();
            }).catch((error: any) => {
                console.error(error);
            });
        } else {
            alert("Addition Cancelled");
        }
    };

    const UpdateData = () => {
        // let testLookup:any = []
        // let lookup = parseInt(colName.TestLookup)
        // if(lookup != null){      
        //     testLookup.push(lookup)
        // }
        // let hobbies:any = []
        // let myHobby = parseInt(colName.Hobbies)
        // if(myHobby != null){ 
        //     hobbies.push(myHobby)
        // }
        const updateDataValue = {
            // ID: colName.Id,
            Title: colName.Title,
            Name: colName.Name,
            Address: colName.Address,
            MobileNo: colName.MobileNo,
            DOB: colName.DOB,
            Skills: colName.Skills,
            TestLookupId:  colName.TestLookup.Title ? colName.TestLookup.Id.toString() : colName.TestLookup ,
            HobbiesId: colName.Hobbies.Hobbies ? colName.Hobbies.Id.toString() : colName.Hobbies ,
        };

        const confirmUpdate = window.confirm("Are you sure you want to update this item?");

        if (confirmUpdate) {
            const web = new Web(baseURL);
            web.lists.getById(listId).items.getById(updateVal.Id).update(updateDataValue).then((response: any) => {
                alert("Update Successful");
                closeUpdatePanel();
                getListData();
                getLookupListData();
            }).catch((error: any) => {
                console.error(error);
            });
        } else {
            alert("Updation Cancelled");
        }
    };


    // deleting data from the list
    const DeleteData = (data: any) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this item?');
        if (confirmDelete) {
            const web = new Web(baseURL);
            web.lists.getById(listId).items.getById(data.Id).recycle().then((response: any) => {
                alert('Delete Successful');
                getListData()
                getLookupListData()
            })
                .catch((error: any) => {
                    console.error(error);
                });
        }
        else {
            alert("Deletion Cancelled")
        }
    };

    // GlobalCommonTable code
    const columns = React.useMemo<ColumnDef<any, unknown>[]>(() =>
        [{
            accessorKey: "Id", placeholder: "ID", header: "", size: 50,
        },
        {
            accessorKey: "Title", placeholder: "Title", header: "", size: 50,
        },
        {
            accessorKey: "Name", placeholder: "Name", header: "", size: 80,
        },
        {
            accessorKey: "Address", placeholder: "Address", header: "", size: 60,
        },
        {
            accessorKey: "MobileNo", placeholder: "MobileNo", header: "", size: 60,
        },
        {
            accessorKey: "DOB", placeholder: "DOB", header: "", size: 60,
        },
        {
            accessorKey: "Skills", placeholder: "Skills", header: "", size: 60,
        },
        {
            accessorKey: "TestLookup.Title", placeholder: "Lookup", header: "", size: 60,
        },
        {
            accessorKey: "Hobbies.Hobbies", placeholder: "hobby", header: "", size: 60,
        },
      
        {
            cell: ({ row, getValue }) => (
                <>
                    <a onClick={() => updateHandler(row.original)} title="Edit Item"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="25" viewBox="0 0 48 48" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 21.9323V35.8647H13.3613H19.7226V34.7589V33.6532H14.3458H8.96915L9.0264 25.0837L9.08387 16.5142H24H38.9161L38.983 17.5647L39.0499 18.6151H40.025H41V13.3076V8H24H7V21.9323ZM38.9789 12.2586L39.0418 14.4164L24.0627 14.3596L9.08387 14.3027L9.0196 12.4415C8.98428 11.4178 9.006 10.4468 9.06808 10.2838C9.1613 10.0392 11.7819 9.99719 24.0485 10.0441L38.9161 10.1009L38.9789 12.2586ZM36.5162 21.1565C35.8618 21.3916 34.1728 22.9571 29.569 27.5964L23.4863 33.7259L22.7413 36.8408C22.3316 38.554 22.0056 39.9751 22.017 39.9988C22.0287 40.0225 23.4172 39.6938 25.1029 39.2686L28.1677 38.4952L34.1678 32.4806C41.2825 25.3484 41.5773 24.8948 40.5639 22.6435C40.2384 21.9204 39.9151 21.5944 39.1978 21.2662C38.0876 20.7583 37.6719 20.7414 36.5162 21.1565ZM38.5261 23.3145C39.2381 24.2422 39.2362 24.2447 32.9848 30.562C27.3783 36.2276 26.8521 36.6999 25.9031 36.9189C25.3394 37.0489 24.8467 37.1239 24.8085 37.0852C24.7702 37.0467 24.8511 36.5821 24.9884 36.0529C25.2067 35.2105 25.9797 34.3405 31.1979 29.0644C35.9869 24.2225 37.2718 23.0381 37.7362 23.0381C38.0541 23.0381 38.4094 23.1626 38.5261 23.3145Z" fill="#333333"></path></svg></a>
                    {getValue()}
                </>
            ),
            accessorKey: '',
            canShort: false,
            placeholder: '',
            header: '',
            id: 'row.original',
            size: 30
        }, {
            cell: ({ row, getValue }) => (
                <>
                    <a onClick={() => DeleteData(row.original)} title="Delete Item"><svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 48 48" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.3584 5.28375C18.4262 5.83254 18.1984 6.45859 18.1891 8.49582L18.1837 9.66172H13.5918H9V10.8591V12.0565H10.1612H11.3225L11.3551 26.3309L11.3878 40.6052L11.6525 41.1094C11.9859 41.7441 12.5764 42.3203 13.2857 42.7028L13.8367 43H23.9388C33.9989 43 34.0431 42.9989 34.6068 42.7306C35.478 42.316 36.1367 41.6314 36.4233 40.8428C36.6697 40.1649 36.6735 39.944 36.6735 26.1055V12.0565H37.8367H39V10.8591V9.66172H34.4082H29.8163L29.8134 8.49582C29.8118 7.85452 29.7618 7.11427 29.7024 6.85084C29.5542 6.19302 29.1114 5.56596 28.5773 5.2569C28.1503 5.00999 27.9409 4.99826 23.9833 5.00015C19.9184 5.0023 19.8273 5.00784 19.3584 5.28375ZM27.4898 8.46431V9.66172H24H20.5102V8.46431V7.26691H24H27.4898V8.46431ZM34.4409 25.9527C34.4055 40.9816 34.4409 40.2167 33.7662 40.5332C33.3348 40.7355 14.6335 40.7206 14.2007 40.5176C13.4996 40.1889 13.5306 40.8675 13.5306 25.8645V12.0565H24.0021H34.4736L34.4409 25.9527ZM18.1837 26.3624V35.8786H19.3469H20.5102V26.3624V16.8461H19.3469H18.1837V26.3624ZM22.8367 26.3624V35.8786H24H25.1633V26.3624V16.8461H24H22.8367V26.3624ZM27.4898 26.3624V35.8786H28.6531H29.8163V26.3624V16.8461H28.6531H27.4898V26.3624Z" fill="#333333"></path></svg></a>
                    {getValue()}
                </>
            ),
            accessorKey: '',
            canShort: false,
            placeholder: '',
            header: '',
            id: 'row.original',
            size: 30
        },], [listItems]);

    const callBackData = React.useCallback((_elem: any, getSelectedRowModel: any, ShowingData: any) => {
    }, []);




    return (
        <>
            <h5>Welcome to's WebPart</h5>
            <hr />

            <div >
                {listItems && <div>
                    <GlobalCommanTable showPagination={true} columns={columns} data={listItems} showHeader={true} callBackData={callBackData} />
                </div>}





                <PrimaryButton onClick={openAddPanel} >Open Add Item</PrimaryButton>

                <div>
                    <Panel
                        isOpen={isAddOpen}
                        onDismiss={closeAddPanel}
                        headerText="Add or Update                                                 "
                        closeButtonAriaLabel="Close"
                    >
                        <form action="">
                            <br /><br />
                            <label htmlFor=""> Enter Title : </label>
                            <input type="text" onChange={e => setData({ ...colName, Title: e.target.value })} />
                            <br /><br />
                            <label htmlFor=""> Enter Name: </label>
                            <input type="text" onChange={e => setData({ ...colName, Name: e.target.value })} />
                            <br /><br />

                            <label htmlFor=""> Enter Address : </label>
                            <input type="text" onChange={e => setData({ ...colName, Address: e.target.value })} />
                            <br /><br />
                            <label htmlFor=""> Enter Mobile : </label>
                            <input type="text" onChange={e => setData({ ...colName, MobileNo: e.target.value })} />
                            <br /><br />
                            <label htmlFor=""> Enter DOB : </label>
                            <input type="text" onChange={e => setData({ ...colName, DOB: e.target.value })} />
                            <br /><br />
                            <label htmlFor=""> Enter Skills : </label>
                            <input type="text" onChange={e => setData({ ...colName, Skills: e.target.value })} />
                            <br /><br />

                            <label htmlFor="">Enter TestLookup: </label>
                            <select id="TestLookup" name="Lookup" onChange={e => setData({ ...colName, TestLookup: e.target.value })}>
                                <option>Select</option>
                                {
                                    lookuplistitems?.map((elem: any) =>
                                        <option value={elem.Id}>{elem.Title}</option>
                                    )
                                }
                            </select>
                            <br /><br />

                            <label htmlFor="">Enter hobby: </label>
                            <select id="Hobbies" name="hobby" onChange={e => setData({ ...colName, Hobbies: e.target.value })}>
                                <option>Select</option>
                                {
                                    lookuplistitems?.map((elem: any) =>
                                        <option value={elem.Id}>{elem.Hobbies}</option>
                                    )
                                }
                            </select>
                            <br /><br />

                            <PrimaryButton type='button' onClick={AddData} >Add</PrimaryButton>
                        </form>
                    </Panel>
                </div>
                <div>
                    <Panel
                        isOpen={isUpdateOpen}
                        onDismiss={closeUpdatePanel}
                        headerText="Update"
                        closeButtonAriaLabel="Close"
                    >
                        <form action="">
                            <br /><br />
                            <label htmlFor=""> Enter Title : </label>
                            <input type="text" value={colName.Title} onChange={e => setData({ ...colName, Title: e.target.value })} />
                            <br /><br />
                            <label htmlFor=""> Enter Name : </label>
                            <input type="text" value={colName.Name} onChange={e => setData({ ...colName, Name: e.target.value })} />
                            <br /><br />

                            <label htmlFor=""> Enter Address : </label>
                            <input type="text" value={colName.Address} onChange={e => setData({ ...colName, Address: e.target.value })} />
                            <br /><br />
                            <label htmlFor=""> Enter Mobile : </label>
                            <input type="text" value={colName.MobileNo} onChange={e => setData({ ...colName, MobileNo: e.target.value })} />
                            <br /><br />
                            <label htmlFor=""> Enter DOB : </label>
                            <input type="text" value={colName.DOB} onChange={e => setData({ ...colName, DOB: e.target.value })} />
                            <br /><br />
                            <label htmlFor=""> Enter Skills : </label>
                            <input type="text" value={colName.Skills} onChange={e => setData({ ...colName, Skills: e.target.value })} />
                            <br /><br />

                            <label htmlFor="">Enter TestLookup: </label>
                            <select id="TestLookup" name="Lookup" value={colName.TestLookup} onChange={e => setData({ ...colName, TestLookup: e.target.value })}>
                                <option>Select</option>
                                {
                                    lookuplistitems?.map((ele: any) =>
                                        <option value={ele.Id}>{ele.Title}</option>
                                    )
                                }
                            </select>
                            <br /><br />

                            <label htmlFor="">Enter hobby: </label>
                            <select id="Hobbies" name="hobby" value={colName.Hobbies} onChange={e => setData({ ...colName, Hobbies: e.target.value })}>
                                <option>Select</option>
                                {
                                    lookuplistitems?.map((ele: any) =>
                                        <option value={ele.Id}>{ele.Hobbies}</option>
                                    )
                                }
                            </select>
                            <br /><br />


                            <PrimaryButton type='button' onClick={UpdateData}>Update</PrimaryButton>
                        </form>
                    </Panel>
                </div>
            </div>
            <h6>Time: {time.toLocaleTimeString()}</h6>
        </>
    )

}
