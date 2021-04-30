import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import PropTypes from 'prop-types';
import CheckIcon from '@material-ui/icons/Check';
import Grid from '@material-ui/core/Grid';
import { appContext } from '../../contexts/app';
import {
  SERVICE_TYPE_LABELS,
  SERVICE_TYPE_MONTHLY_FEE,
} from '../../util/constants';
import Input, { InputTitle, Separator } from '../../common/molecules/Input';
import Button from '../../common/atoms/Button';
import RewardInput from './inputs/RewardInput';
import { setFormErrors } from '../../util/form';
import Message from '../../common/atoms/Message';

const DefaultCampaignForm = ({ campaign }) => {
  const { api } = useContext(appContext);
  const history = useHistory();
  const [isSaving, setIsSaving] = useState(false);

  const [hasAffiliates] = useMemo(() => {
    return [
      campaign.affiliates && campaign.affiliates.length > 0,
      (campaign.affiliates || []).reduce((memo, { discountCodes }) => {
        discountCodes.forEach(({ code }) => memo.add(code));
        return memo;
      }, new Set()),
    ];
  }, [campaign]);

  const { handleSubmit, register, errors, watch, setError, setValue } = useForm(
    {
      defaultValues: campaign,
      mode: 'onBlur',
    },
  );

  useEffect(() => {
    register({ name: 'publish' });
  }, [register]);

  const onSubmit = async formValues => {
    // drawback of react-hook-form
    const valuesToSave = {
      ...formValues,
    };
    try {
      setIsSaving(true);
      await api.post('campaign/default', valuesToSave);
      history.push('/my/campaigns');
    } catch (error) {
      setFormErrors(error, setError);
    }
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <InputTitle marginBottom={18} block>
        Reward type : <b>{SERVICE_TYPE_LABELS[SERVICE_TYPE_MONTHLY_FEE]}</b>
      </InputTitle>
      <RewardInput
        {...{
          register,
          watch,
          errors,
          setValue,
          campaign,
          canEdit: !hasAffiliates,
        }}
      />

      <Separator />
      <Input
        type="textarea"
        name="termsAndConditions"
        rows={6}
        isRequired
        placeholder="Terms and conditions for this campaign"
        title="Terms and conditions"
        error={errors.termsAndConditions}
        disabled={hasAffiliates}
        ref={register({ required: 'Required' })}
      />

      <Message muted>This is your default campaign</Message>

      <Grid container spacing={1}>
        <Grid item xs={12} sm={8}>
          <Button
            type="Submit"
            marginTop={8}
            primary
            minWidth={240}
            withIcon
            fullWidthOnMobile
            isLoading={isSaving}
            onClick={() => setValue('publish', true)}
          >
            <CheckIcon />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

DefaultCampaignForm.propTypes = {
  campaign: PropTypes.object,
};

export default DefaultCampaignForm;
