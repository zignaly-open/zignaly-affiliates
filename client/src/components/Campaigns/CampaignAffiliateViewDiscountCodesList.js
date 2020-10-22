import React, { useCallback, useContext, useMemo, useState } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import FileCopy from '@material-ui/icons/FileCopy';
import Delete from '@material-ui/icons/Delete';
import TableRow from '@material-ui/core/TableRow';
import moment from 'moment';
import Confirm from '../../common/molecules/Confirm';
import Title from '../../common/atoms/Title';
import DiscountCode from '../../common/molecules/DiscountCode';
import { affiliateCampaignContext } from '../../context/affiliateCampaign';
import CopyButton from '../../common/molecules/CopyButton';
import Button from '../../common/Button';
import { appContext } from '../../context/app';
import Code from '../../common/atoms/Code';
import Loader from '../../common/Loader';

const CampaignAffiliateViewDiscountCodesList = () => {
  const { api } = useContext(appContext);
  const [deletingCode, setDeletingCode] = useState();
  const { campaign, reloadCampaignSilently } = useContext(
    affiliateCampaignContext,
  );
  const [loading, setLoading] = useState();
  const { discountCodes, affiliate } = campaign;
  const affiliateCodes = useMemo(
    () =>
      (affiliate?.discountCodes || [])
        .map(d => ({
          original: d,
          ...d,
          ...(discountCodes.find(x => x.code === d.code) || {}),
          code: d.code + d.subtrack,
        }))
        .filter(x => x.type),
    [affiliate, discountCodes],
  );

  const deleteCode = useCallback(async () => {
    setLoading(true);
    await api.delete(`campaign/marketplace/${campaign._id}/code`, deletingCode);
    reloadCampaignSilently();
  }, [api, deletingCode, campaign]);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Confirm
        shown={!!deletingCode}
        title="Remove Code"
        description="The code will stop working, new users trying to use it will not be counted as conversions"
        cancelAction={() => setDeletingCode()}
        okAction={deleteCode}
      />

      <br />
      <Title>Your Codes</Title>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Code</TableCell>
            <TableCell>Subtrack</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {affiliateCodes.map(row => (
            <TableRow key={row.code}>
              <TableCell component="th" scope="row">
                <DiscountCode showCopy code={row} />
              </TableCell>
              <TableCell>
                <Code>{row.subtrack}</Code>
              </TableCell>
              <TableCell data-tootik={row.date && moment(row.date).format()}>
                {row.date && moment(row.date).fromNow('')}
              </TableCell>
              <TableCell align="right">
                <CopyButton
                  label={<FileCopy />}
                  copyText={row.code}
                  buttonProperties={{
                    'data-tootik': 'Copy code to clipboard',
                    secondary: true,
                    link: true,
                  }}
                />{' '}
                <Button
                  secondary
                  data-tootik="Delete code"
                  link
                  onClick={() => setDeletingCode(row.original)}
                >
                  <Delete />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

CampaignAffiliateViewDiscountCodesList.propTypes = {};

export default CampaignAffiliateViewDiscountCodesList;
