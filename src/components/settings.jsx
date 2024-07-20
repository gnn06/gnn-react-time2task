import { useMemo } from 'react';
import { Box, IconButton, Button } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Link } from "react-router-dom";
import { MaterialReactTable, useMaterialReactTable  } from 'material-react-table';

import { useGetActivitiesQuery, useUpdateActivityMutation, useDeleteActivityMutation, useAddActivityMutation } from "../features/apiSlice.js";
  
export default function Settings() {
    const { data, isLoading, isSuccess } = useGetActivitiesQuery()
    const [ addActivity ]                = useAddActivityMutation()
    const [ updateActivity ]             = useUpdateActivityMutation()
    const [ deleteActivity ]             = useDeleteActivityMutation()
  
    const handleCreateActivity =  async ({values, table}) => { 
        await addActivity(values)
        table.setCreatingRow(null)
    };
    const handleSaveUser = async ({row, values, table}) => {
        updateActivity({...values, id: row.id })
        table.setEditingRow(null); //exit editing mode
      };
    const handleDeleteActivity = async (row, table) => {
        if (window.confirm('confirm ?')) {
          await deleteActivity(row.id).unwrap()
        }
    };    
    const columns = useMemo(
        () => [
          {
            header: 'Label',
            accessorKey: 'label', //simple recommended way to define a column
          },
        ],
        [],
      );
    const table = useMaterialReactTable({
        columns,
        data: data || [], //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
        enableRowSelection: false, //enable some features
        enableColumnOrdering: false, //enable a feature for all columns
        enableGlobalFilter: false, //turn off a feature
        enableColumnActions: false,
        enableHiding: false,
        enableSorting: false,
        enableEditing: true,
        enablePagination: false,
        enableFilters: false,
        enableDensityToggle: false,
        enableFullScreenToggle: false,
        positionActionsColumn: 'last',
        onEditingRowSave: handleSaveUser,
        getRowId: (originalRow) => originalRow.id,
        renderRowActions: ({row, table}) => (
          <Box>
            <IconButton onClick={() => table.setEditingRow(row)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleDeleteActivity(row, table)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ),
        createDisplayMode: 'modal',
        renderTopToolbarCustomActions: ({ table }) => (
          <Button
            onClick={() => {
              table.setCreatingRow(true); 
            }}
          >
            Create New Activity
          </Button>
        ),
        onCreatingRowSave: handleCreateActivity,
      });
    
    return <div>
        <Link to={'/'}>Retour à l'application</Link>
        <MaterialReactTable table={table} />
    </div>
}