import * as React from 'react'
import { useState, useEffect } from "react";
import {
    Column,
    Table,
    useReactTable,
    ColumnFiltersState,     // full column A To Z item filter  
    getCoreRowModel,         // Not data get or column this page
    getFilteredRowModel,     // full row filter item ,search box 
   //  getFacetedRowModel,
    // getFacetedUniqueValues,
    // getFacetedMinMaxValues,
    // sortingFns,
    getSortedRowModel,
    FilterFn,
    // SortingFn,
    // ColumnDef,
    flexRender,
    getPaginationRowModel

} from '@tanstack/react-table'
import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import { FaSearch, FaSortDown, FaSortUp, FaSort, FaAngleDoubleLeft, FaAngleDoubleRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";        //React Icon
import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { RiFileExcel2Fill } from "react-icons/ri";
// import { PrimaryButton } from '@fluentui/react';

// ReactTable Part/////
declare module "@tanstack/table-core" {
    interface FilterFns {
        fuzzy: FilterFn<any>;
    }
    interface FilterMeta {
        itemRank: RankingInfo;
    }
}
const fuzzyFilter: FilterFn<any> = (row: { getValue: (arg0: any) => any; }, columnId: any, value: string, addMeta: (arg0: { itemRank: RankingInfo; }) => void) => {
    // Rank the item
    const itemRank = rankItem(row.getValue(columnId), value);

    // Store the itemRank info
    addMeta({
        itemRank
    });

    // Return if the item should be filtered in/out
    return itemRank.passed;
};

///Global Filter Parts//////
// A debounced input react component

//////////////////////////////////////////////Export to Column Filter /////////////////////////////////////////////////////////////////////////

function Filter({

    column,
    table,
    placeholder,

}: {

    column: Column<any, any>;
    table: Table<any>;
    placeholder: any;

}): any {

    const columnFilterValue = column.getFilterValue();
    return (

        <input
            style={{ width: "100%" }}
            className="me-1 mb-1 on-search-cross form-control "
            title={placeholder?.placeholder}
            type="search"
            value={(columnFilterValue ?? "") as string}
            onChange={(e) => column.setFilterValue(e.target.value)}
            placeholder={`${placeholder?.placeholder}`}
        />

    );

}
 
//////////////////////Export to, All Column Search box //////////////////////////////////////////////////////////////

function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 500,
    ...props
}: {
    value: string | number
    onChange: (value: string | number) => void
    debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
    const [value, setValue] = React.useState(initialValue)

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value)
        }, debounce)

        return () => clearTimeout(timeout)
    }, [value])

    return (
        <>
            <div className="container-2 mx-1">
                <span className="icon"><FaSearch /></span>
                <input type="search" id="search" {...props}
                    value={value}
                    onChange={(e) => setValue(e.target.value)} />
            </div>
        </>
    );
}


const GlobalCommonTable = (props: any) => {
    let data = props?.data;
    let columns = props?.columns;
    // let excelDatas = props?.excelDatas;
    const fileExtension = ".xlsx";
    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    const table = useReactTable({
        data,
        columns,
        filterFns: {
            fuzzy: fuzzyFilter
        },
        state: {
            columnFilters,
            globalFilter,
        },
        onColumnFiltersChange: setColumnFilters,
        globalFilterFn: fuzzyFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        // getFacetedRowModel: getFacetedRowModel(),
        // getFacetedUniqueValues: getFacetedUniqueValues(),
        // getFacetedMinMaxValues: getFacetedMinMaxValues(),
        debugTable: true,
        debugHeaders: true,
        debugColumns: false,
        //filterFns: undefined
    });

    ////////////////////////////////////////////Export to Excel////////////////////////////////////////////////////////////////////////////////////////
    const downloadPdf = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        autoTable(doc, {
            html: '#my-table'
        })
        doc.save('Data PrintOut');
    }
    

    const downloadExcel = (fileName: any) => {
        const filteredData = table?.getFilteredRowModel()?.rows.map(row => row.original);

        const ws = XLSX.utils.json_to_sheet(filteredData);
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };

        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, fileName + fileExtension);
    };



    return (
        <>
            <div className='tableheader-icon'>
                <a onClick={() => downloadExcel("New")} style={{ color: '#03787c', float: 'right' }}>
                    <RiFileExcel2Fill />
                </a>
                <a onClick={() => downloadPdf()}>
                </a>
            </div>
{/* ////////////////////////////Search box  ///////////////////// */}
            <div className='d-flex justify-content-between py-1' style={{ float: 'right' }}>
                <div>
                    <span className='ms-2 me-2'>{`Showing ${table?.getFilteredRowModel()?.rows?.length} out of ${data?.length} items`}</span>
                    <DebouncedInput className='searchs'
                        value={globalFilter ?? ""}
                        onChange={(value) => setGlobalFilter(String(value))}
                        placeholder="Search All..."
                    />
                </div>



            </div>

            <table className="SortingTable table table-hover mb-0 " id="my-table" style={{ width: "100%" }}>
                <thead>
                    {table?.getHeaderGroups()?.map((headerGroup) => (
                        <tr key={headerGroup?.id}>
                            {headerGroup?.headers?.map((header) => {
                                return (
                                    <th key={header.id} style={header.column.columnDef.size != undefined && header.column.columnDef.size != 100 ? { width: header.column.columnDef.size + "px" } : {}}>
                                        {header.isPlaceholder ? null : (
                                            <div className="position-relative" style={{ display: "flex" }}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {header.column.getCanFilter() ? (
                                                    // <span>
                                                    <Filter column={header.column} table={table} placeholder={header.column.columnDef}
                                                    />
                                                ) : // </span>
                                                    null}
                                                {header.column.getCanSort() ? (
                                                    <div
                                                        {...{
                                                            className:
                                                                header.column.getCanSort()
                                                                    ? "cursor-pointer select-none shorticon"
                                                                    : "",
                                                            onClick:
                                                                header.column.getToggleSortingHandler(),
                                                        }}
                                                    >
                                                        {header.column.getIsSorted() ? (
                                                            {
                                                                asc: <FaSortDown />,
                                                                desc: <FaSortUp />,
                                                            }[header.column.getIsSorted() as string] ?? null) : (<FaSort />)}
                                                    </div>) : ("")}
                                            </div>
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    ))}
                </thead>
                <tbody className='rowss'>
                    {table.getRowModel().rows.map(row => {
                        return (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => {
                                    return (
                                        <td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>

  {/* /////////////////////////////////////////Export to pagination///////////////////////////////////////////////////////////////////////////////////////////////  */}

            <div className="d-flex gap-2 items-center mb-3 mx-2">
                <button type='button'
                    className="border rounded p-1"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                >
                    <FaAngleDoubleLeft />
                </button>
                <button type='button'
                    className="border rounded p-1"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    <FaChevronLeft />
                </button>
                
                <button type='button'
                    className="border rounded p-1"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    <FaChevronRight />
                </button>
                <button type='button'
                    className="border rounded p-1"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                >
                    <FaAngleDoubleRight />
                </button>
                <span className="flex items-center gap-1">
                    <div>Page</div>
                    <strong>
                        {table.getState().pagination.pageIndex + 1} of{' '}
                        {table.getPageCount()}
                    </strong>
                </span>
                <span className="flex items-center gap-1">
                    | Go to page:
                    <input
                        type="number"
                        defaultValue={table.getState().pagination.pageIndex + 1}
                        onChange={e => {
                            const page = e.target.value ? Number(e.target.value) - 1 : 0
                            table.setPageIndex(page)
                        }}
                        className="border p-1 rounded w-16"
                    />
                </span>
                <select
                    value={table.getState().pagination.pageSize}
                    onChange={e => {
                        table.setPageSize(Number(e.target.value))
                    }}
                >
                    {[0,2,5,10, 20, 30, 40, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>

        </>
    )
}
export default GlobalCommonTable
