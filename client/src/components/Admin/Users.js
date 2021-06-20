import React, { useCallback, useContext, useMemo, useState } from 'react';
import moment from 'moment';
import styled, { css } from 'styled-components';
import useAsync from 'react-use/lib/useAsync';
import { appContext } from '../../contexts/app';
import Button from '../../common/atoms/Button';
import Loader from '../../common/atoms/Loader';
import Content from '../../common/molecules/Content';
import Select from '../../common/molecules/Select';
import DataTable from '../../common/organisms/Table/DataTable';
import { USER_AFFILIATE, USER_MERCHANT } from '../../util/constants';
import {
  column,
  COLUMN_DATE,
  COLUMN_EMAIL,
  COLUMN_MERCHANT,
} from '../../common/organisms/Table/common';

const periodOptions = [
  {
    start: moment().startOf('week'),
    label: 'This week',
  },
  {
    start: moment().subtract(7, 'days').startOf('day'),
    label: 'Last 7 days',
  },
  {
    start: moment().startOf('month'),
    label: 'This week',
  },
  {
    start: moment().subtract(30, 'days').startOf('day'),
    label: 'Last 7 days',
  },
  {
    start: moment().year(2020),
    label: 'All time',
  },
];

const roleOptions = [
  { label: 'Affiliate', value: USER_AFFILIATE },
  { label: 'Merchant', value: USER_MERCHANT },
];

const AdminUsers = () => {
  const [period, setPeriod] = useState(periodOptions[0]);
  const [selectedRole, setSelectedRole] = useState(USER_AFFILIATE);
  const { api } = useContext(appContext);
  const { loading, value: data } = useAsync(
    async () => api.get(`admin/users`, { from: +period.start }),
    [period],
  );
  const dataToShow = useMemo(
    () =>
      selectedRole === USER_AFFILIATE ? data?.affiliates : data?.merchants,
    [selectedRole, data],
  );
  const tableHeader = useMemo(
    () =>
      selectedRole === USER_AFFILIATE
        ? [column('Name'), COLUMN_EMAIL, COLUMN_DATE]
        : [COLUMN_MERCHANT, column('Zignaly Id'), COLUMN_EMAIL, COLUMN_DATE],
    [selectedRole],
  );

  const dataMapper = useCallback(
    user =>
      selectedRole === USER_AFFILIATE
        ? [user.name, user.email, user.date]
        : [user, user.zignalyId, user.email, user.date],
    [selectedRole],
  );

  return (
    <Content title="New registrations" hideHr>
      <div>
        {periodOptions.map(p => (
          <HighlightableButton
            link
            key={+p.start}
            compact
            active={p === period}
            onClick={() => setPeriod(p)}
          >
            {p.label}
          </HighlightableButton>
        ))}
      </div>

      {loading || !dataToShow ? (
        <Loader />
      ) : (
        <DataTable
          data={{ table: dataToShow }}
          header={tableHeader}
          dataMapper={dataMapper}
          controls={
            <div style={{ marginTop: '10px' }}>
              <Select
                label="Type"
                value={selectedRole}
                onChange={setSelectedRole}
                options={roleOptions}
              />
            </div>
          }
        />
      )}
    </Content>
  );
};

export default AdminUsers;

const HighlightableButton = styled(Button)`
  display: inline-block;
  opacity: 0.8;
  margin-right: 15px !important;
  margin-bottom: 20px !important;
  ${props =>
    props.active &&
    css`
      text-decoration: underline !important;
      opacity: 1;
    `};
`;
