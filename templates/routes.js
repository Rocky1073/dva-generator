import React from 'react';
import { connect } from 'dva';

import styles from './{{=it.name}}.less';

@connect(({ {{=it.name}} }) => ({ {{=it.name}} }))
export default class {{=it.name}} extends React.Component{
  render(){
    return(
        <div id="{{=it.id}}" className={styles.{{=it.id}}}>

        </div>
    )
  }
}
