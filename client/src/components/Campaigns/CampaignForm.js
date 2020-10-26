import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import PropTypes from 'prop-types';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckIcon from '@material-ui/icons/Check';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import Grid from '@material-ui/core/Grid';
import { appContext } from '../../context/app';
import {
  SERVICE_BASE,
  SERVICE_TYPE_LABELS,
  SERVICE_TYPE_MONTHLY_FEE,
  SERVICE_TYPE_PROFIT_SHARING,
} from '../../util/constants';
import Input, {
  ErrorText,
  InputTitle,
  Separator,
} from '../../common/molecules/Input';
import DiscountCodeInput, { newDiscountCode } from './inputs/DiscountCodeInput';
import Button from '../../common/Button';
import Muted from '../../common/atoms/Muted';
import RewardInput from './inputs/RewardInput';
import FileInput from '../../common/molecules/FileInput';
import { setFormErrors } from '../../util/form';
import Message from '../../common/atoms/Message';
import Confirm from '../../common/molecules/Confirm';

const CampaignForm = ({ campaign }) => {
  const { api } = useContext(appContext);
  const history = useHistory();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);
  const isNew = !campaign._id;
  const [hasAffiliates, nonEditableCodes] = useMemo(() => {
    return [
      campaign.affiliates && campaign.affiliates.length > 0,
      (campaign.affiliates || []).reduce((memo, { discountCodes }) => {
        discountCodes.forEach(({ code }) => memo.add(code));
        return memo;
      }, new Set()),
    ];
  }, [campaign]);

  const {
    handleSubmit,
    register,
    errors,
    watch,
    setError,
    setValue,
    control,
  } = useForm({ defaultValues: campaign });

  const deleteCampaign = useCallback(async () => {
    await api.delete(`campaign/my/${campaign._id}`);
    history.push('/my/campaigns');
  }, [campaign, api, history]);

  const {
    fields: discountCodes,
    append: addDiscountCode,
    remove: removeDiscountCode,
  } = useFieldArray({
    control,
    name: 'discountCodes',
  });

  useEffect(() => {
    register({ name: 'landingPage' }, { required: 'Required' });
    register({ name: 'media' }, { required: 'Required' });
    register({ name: 'publish' });
  }, [register]);

  const onSubmit = useCallback(
    async values => {
      try {
        setIsSaving(true);
        if (isNew) {
          await api.post('campaign', values);
          history.push('/my/campaigns');
        } else {
          await api.put(`campaign/my/${campaign._id}`, values);
          setIsSaved(true);
        }
      } catch (error) {
        setIsSaved(false);
        setFormErrors(error, setError);
      }
      setIsSaving(false);
    },
    [api, setError, history, isNew, campaign],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Confirm
        shown={isDeleting}
        title="Remove Campaign"
        description="Removing this campaign means that new conversions from now won’t be accounted for the affiliate"
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
        useRef={register({ required: 'Required' })}
      />

      <Input
        type="textarea"
        name="shortDescription"
        rows={3}
        isRequired
        placeholder="Provide a short description of your campaign (150 chars max)"
        title="Short description"
        error={errors.shortDescription}
        useRef={register({
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
        useRef={register({})}
      />

      <InputTitle marginBottom={18} block isRequired={!hasAffiliates}>
        Service type
        {hasAffiliates ? (
          <>
            : <b>{SERVICE_TYPE_LABELS[campaign.serviceType]}</b>
          </>
        ) : null}
      </InputTitle>

      {!hasAffiliates && (
        <Input
          type="radio"
          name="serviceType"
          inline
          value={SERVICE_TYPE_MONTHLY_FEE}
          title={SERVICE_TYPE_LABELS[SERVICE_TYPE_MONTHLY_FEE]}
          error={errors.serviceType}
          useRef={register()}
        />
      )}

      {!hasAffiliates && (
        <Input
          type="radio"
          inline
          name="serviceType"
          value={SERVICE_TYPE_PROFIT_SHARING}
          useRef={register()}
          title={SERVICE_TYPE_LABELS[SERVICE_TYPE_PROFIT_SHARING]}
          error={errors.serviceType}
        />
      )}

      <RewardInput
        {...{ register, watch, errors, campaign, canEdit: !hasAffiliates }}
      />

      {hasAffiliates && (
        <Message danger>
          Some fields are not editable because there are active affiliates
        </Message>
      )}

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

      <Input
        type="text"
        name="zignalyServiceId"
        isRequired
        placeholder="Zignaly service ID"
        title="Zignaly service ID"
        error={errors.zignalyServiceId}
        useRef={register({ required: 'Required' })}
      />

      <FileInput
        onError={uploadErrors => setFormErrors(uploadErrors, setError)}
        onChange={v => setValue('media', v)}
        label="Creatives"
        isMultiple
        onUploadStarted={() => setIsSaveDisabled(true)}
        onUploadEnded={() => setIsSaveDisabled(false)}
        file={watch('media')}
      />

      {errors.media && errors.media.message && (
        <ErrorText>{errors.media.message}</ErrorText>
      )}

      <InputTitle marginBottom={18} block>
        Discount codes
      </InputTitle>

      {(!discountCodes || discountCodes.length === 0) && (
        <Muted block marginBottom={20}>
          No discount codes
        </Muted>
      )}

      {(discountCodes || []).map((code, i) => (
        <DiscountCodeInput
          key={code.id}
          allCodes={watch('discountCodes')?.map(x => x.code)}
          canEdit={!nonEditableCodes.has(code.code)}
          {...{ register, control }}
          namePrefix={`discountCodes[${i}]`}
          error={errors.discountCodes && errors.discountCodes[i]}
          removeSelf={() => removeDiscountCode(i)}
          {...watch(`discountCodes[${i}]`)}
        />
      ))}

      {typeof errors.discountCodes === 'string' && errors.discountCodes && (
        <ErrorText>{errors.discountCodes}</ErrorText>
      )}

      <Button
        compact
        type="button"
        withIcon
        onClick={() => addDiscountCode(newDiscountCode())}
      >
        <AddIcon />
        Add discount code
      </Button>

      <Separator />

      <Input
        type="textarea"
        name="termsAndConditions"
        rows={6}
        isRequired
        placeholder="Terms and conditions for this campaign"
        title="Terms and conditions"
        error={errors.termsAndConditions}
        useRef={register({ required: 'Required' })}
      />

      {isSaved && (
        <Message success>
          Changes saved. <Link to="/my/campaigns">Back to campaigns list</Link>
        </Message>
      )}

      <Grid container spacing={1}>
        <Grid item xs={12} sm={8}>
          <Button
            type="Submit"
            marginTop={8}
            primary
            minWidth={240}
            withIcon
            fullWidthOnMobile
            disabled={isSaveDisabled}
            data-tootik={isSaveDisabled ? 'Wait till the upload finished' : ''}
            isLoading={isSaving}
            onClick={() => setValue('publish', true)}
          >
            <CheckIcon />
            {isSaving && watch('publish')
              ? 'Publishing...'
              : 'Publish in the Marketplace'}
          </Button>

          <Button
            type="Submit"
            marginTop={8}
            withIcon
            fullWidthOnMobile
            data-tootik={isSaveDisabled ? 'Wait till the upload finished' : ''}
            disabled={isSaveDisabled}
            onClick={() => setValue('publish', false)}
          >
            <VisibilityOffIcon />
            {isSaving && !watch('publish') ? 'Publishing...' : 'Publish hidden'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          {!isNew && (
            <Button
              minWidth={100}
              type="button"
              marginTop={8}
              danger
              withIcon
              compact
              onClick={() => setIsDeleting(true)}
            >
              <DeleteIcon />
              Delete
            </Button>
          )}
        </Grid>
      </Grid>
    </form>
  );
};

CampaignForm.propTypes = {
  campaign: PropTypes.object,
};

export default CampaignForm;
