import * as React from 'react';
import type { ITaskUsersProps } from './ITaskUsersProps';
import TaskUserManagementApp from './TaskUserManagementApp';


export default class TaskUsers extends React.Component<ITaskUsersProps, {}> {
  public render(): React.ReactElement<ITaskUsersProps> {
 
    return (
      <TaskUserManagementApp props={this.props}/>
    );
  }
}
