import PropTypes from 'prop-types';
import React from 'react';
import MUTabs from '@material-ui/core/Tabs';
import MUTab from '@material-ui/core/Tab';
import { withStyles } from '@material-ui/styles';

const StyledTabs = withStyles(theme => ({
  root: {
    marginBottom: '20px',
    borderBottom: `1px solid ${theme.colors.blackTrans}`,
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
}))(props => <MUTabs {...props} TabIndicatorProps={{ children: <span /> }} />);

const Tabs = ({ setTab, tabs, selectedTab }) => (
  <StyledTabs value={selectedTab} onChange={(_, value) => setTab(value)}>
    {tabs.map(({ label, value }) => (
      <MUTab key={value} label={label} value={value} />
    ))}
  </StyledTabs>
);

Tabs.propTypes = {
  tabs: PropTypes.array,
  selectedTab: PropTypes.any,
  setTab: PropTypes.func,
};

export default Tabs;
