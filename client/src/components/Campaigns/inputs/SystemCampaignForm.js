import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import PropTypes from 'prop-types';
import CheckIcon from '@material-ui/icons/Check';
import Grid from '@material-ui/core/Grid';
import DeleteIcon from '@material-ui/icons/Delete';
import { appContext } from '../../../contexts/app';
import {
  SERVICE_BASE,
  SERVICE_TYPE_LABELS,
  SERVICE_TYPE_MONTHLY_FEE,
  SERVICE_TYPE_PROFIT_SHARING,
} from '../../../util/constants';
import Input, {
  ErrorText,
  InputTitle,
  Separator,
} from '../../../common/molecules/Input';
import Button from '../../../common/atoms/Button';
import Muted from '../../../common/atoms/Muted';
import RewardInput from './RewardInput';
import FileInput from '../../../common/molecules/FileInput';
import { setFormErrors } from '../../../util/form';
import Message from '../../../common/atoms/Message';
import MoneyCentsInput from './MoneyCentsInput';
import Money from '../../../common/atoms/Money';
import Confirm from '../../../common/molecules/Confirm';

const CampaignForm = ({ campaign }) => {
  const { api } = useContext(appContext);
  const history = useHistory();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isNew = !campaign._id;
  const hasAffiliates = false;

  const {
    handleSubmit,
    register,
    errors,
    watch,
    setError,
    setValue,
    control,
  } = useForm({
    defaultValues: campaign,
    mode: 'onBlur',
  });

  const { fields: serviceIdFields, append: addServiceId } = useFieldArray({
    control,
    name: 'zignalyServiceIds',
  });

  useEffect(() => {
    register({ name: 'landingPage' }, { required: 'Required' });
    register({ name: 'media' }, { required: 'Required' });
    register({ name: 'publish' });
    serviceIdFields.length === 0 && addServiceId({ value: '' });
  }, [register, serviceIdFields, addServiceId]);

  const deleteCampaign = useCallback(async () => {
    await api.delete(`campaign/my/${campaign._id}`);
    history.push('/my/campaigns');
  }, [campaign, api, history]);

  const onSubmit = async formValues => {
    // drawback of react-hook-form
    const valuesToSave = {
      ...formValues,
    };
    try {
      setIsSaving(true);
      if (isNew) {
        await api.post('campaign', valuesToSave);
        history.push('/my/campaigns');
      } else {
        await api.put(`campaign/my/${campaign._id}`, valuesToSave);
        setIsSaved(true);
      }
    } catch (error) {
      setIsSaved(false);
      setFormErrors(error, setError);
    }
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p>
        <Muted>
          This is a system campaign to which users will be attributed from all
          across the applications if the conversion has not yet connected to
          Zignaly and has more than <Money value={campaign.investedThreshold} />{' '}
          invested
        </Muted>
      </p>

      <Confirm
        shown={isDeleting}
        title="Remove SYSTEM (!!!!) Campaign"
        description="Removing this SYSTEM campaign means that no new conversions will be attributed to it. And no default conversions either. I hope you know what you're doing."
        cancelAction={() => setIsDeleting(false)}
        okAction={deleteCampaign}
      />

      <Input
        type="text"
        name="name"
        isRequired
        placeholder="Campaign name"
        title="Campaign name"
        error={errors.name}
        ref={register({ required: 'Required' })}
      />
      <Input
        type="textarea"
        name="shortDescription"
        rows={3}
        isRequired
        placeholder="Provide a short description of your campaign (150 chars max)"
        title="Short description"
        error={errors.shortDescription}
        ref={register({
          required: 'Required',
          validate: value =>
            (value && value.length <= 150) ||
            `150 characters maximum. You've entered ${value.length}`,
        })}
      />
      <Input
        type="textarea"
        name="description"
        rows={5}
        placeholder="Description of your campaign"
        title="Description"
        error={errors.description}
        ref={register({})}
      />

      <Input
        type="text"
        name="landingPage"
        isRequired
        placeholder="Zignaly Landing page"
        title="Landing page"
        error={errors.landingPage}
        onChange={e =>
          setValue(
            'landingPage',
            e.target.value.indexOf(SERVICE_BASE) === 0
              ? e.target.value.slice(SERVICE_BASE.length)
              : '',
          )
        }
        value={SERVICE_BASE + (watch('landingPage') || '')}
      />

      <MoneyCentsInput
        {...{ register, watch, setValue }}
        error={errors.investedThreshold}
        inline
        title="Invested threshold, $"
        isRequired
        min="0"
        placeholder="Threshold, $"
        type="number"
        name="investedThreshold"
      />

      <InputTitle marginBottom={18} block isRequired>
        Reward type
      </InputTitle>
      {!hasAffiliates && (
        <Input
          type="radio"
          name="serviceType"
          inline
          value={SERVICE_TYPE_MONTHLY_FEE}
          title={SERVICE_TYPE_LABELS[SERVICE_TYPE_MONTHLY_FEE]}
          error={errors.serviceType}
          ref={register()}
        />
      )}
      {!hasAffiliates && (
        <Input
          type="radio"
          inline
          name="serviceType"
          value={SERVICE_TYPE_PROFIT_SHARING}
          ref={register()}
          title={SERVICE_TYPE_LABELS[SERVICE_TYPE_PROFIT_SHARING]}
          error={errors.serviceType}
        />
      )}
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
      {hasAffiliates && (
        <Message danger>
          Some fields are not editable because there are active affiliates
        </Message>
      )}

      <FileInput
        onError={uploadErrors => setFormErrors(uploadErrors, setError)}
        onChange={v => setValue('media', v)}
        label={
          <>
            Creatives
            <small>
              Try to keep banner file sizes under 100kb if possible, .gif, .jpg,
              .png are preferred.
            </small>
          </>
        }
        isMultiple
        onUploadStarted={() => setIsSaveDisabled(true)}
        onUploadEnded={() => setIsSaveDisabled(false)}
        file={watch('media')}
      />

      {errors.media && errors.media.message && (
        <ErrorText>{errors.media.message}</ErrorText>
      )}

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

      {isSaved && (
        <Message success>
          Saved. <Link to="/my/campaigns">Back to campaigns list</Link>
        </Message>
      )}

      <Grid container spacing={1}>
        <Grid item xs={12} sm={8}>
          <Button
            type="Submit"
            marginTop={8}
            withIcon
            fullWidthOnMobile
            data-tootik={
              isSaveDisabled ? 'Wait till the upload is finished' : ''
            }
            disabled={isSaveDisabled}
            onClick={() => setValue('publish', false)}
          >
            <CheckIcon />
            {isSaving && !watch('publish') ? 'Saving...' : 'Save'}
          </Button>

          <Button
            minWidth={100}
            type="button"
            marginLeft={8}
            danger
            withIcon
            compact
            onClick={() => setIsDeleting(true)}
          >
            <DeleteIcon />
            Delete
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

CampaignForm.propTypes = {
  campaign: PropTypes.object,
};

export default CampaignForm;
