import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import PropTypes from 'prop-types';
import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import Button from '../Button';
import MUTabs from "@material-ui/core/Tabs";
import MUTab from "@material-ui/core/Tab";
import {withStyles} from "@material-ui/styles";


const StyledTab = withStyles((theme) => ({
  root: {
    textTransform: 'none',
    minWidth: 72,
    letterSpacing: '0.8px',
    fontSize: '1rem',
    '&:hover': {
      color: '#40a9ff',
      opacity: 1,
    },
    '&$selected': {
      color: '#1890ff',
    },
    '&:focus': {
      color: '#40a9ff',
    },
  },
  selected: {},
}))((props) => <MUTab disableRipple {...props} />);


const StyledTabs = withStyles((theme) => ({
  root: {
    marginBottom: '20px',
    borderBottom: '1px solid ' + theme.colors.blackTrans
  },
  indicator: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    '& > span': {
      width: '100%',
      backgroundColor: theme.colors.purple,
    },
  },
}))((props) => <MUTabs {...props} TabIndicatorProps={{ children: <span /> }} />);

const Tabs = ({
  setTab,
  tabs,
  selectedTab
}) => (
  <StyledTabs value={selectedTab} onChange={(_, value) => setTab(value)}>
    {tabs.map(({label, value}) => <StyledTab key={value} label={label} value={value} />)}
  </StyledTabs>
);

Tabs.propTypes = {
  tabs: PropTypes.array,
  setTab: PropTypes.func,
};

export default Tabs;
