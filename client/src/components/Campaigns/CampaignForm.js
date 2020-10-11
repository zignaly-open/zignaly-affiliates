import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import PropTypes from 'prop-types';
import { appContext } from '../../context/app';
import {
  SERVICE_BASE,
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
        setIsSaving(false);
      } catch (error) {
        setFormErrors(error, setError);
      }
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
        isRequired
        rows={5}
        placeholder="Description of your campaign"
        title="Description"
        error={errors.description}
        useRef={register({
          required: 'Required',
        })}
      />

      <InputTitle marginBottom={18} block isRequired>
        Service type
      </InputTitle>

      <Input
        type="radio"
        name="serviceType"
        inline
        value={SERVICE_TYPE_MONTHLY_FEE}
        title="Monthly fee"
        error={errors.serviceType}
        useRef={register()}
      />

      <Input
        type="radio"
        inline
        name="serviceType"
        value={SERVICE_TYPE_PROFIT_SHARING}
        useRef={register()}
        title="Profit sharing"
        error={errors.serviceType}
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
        isRequired
        isMultiple
        onUploadStarted={() => setIsSaveDisabled(true)}
        onUploadEnded={() => setIsSaveDisabled(false)}
        file={watch('media')}
      />

      {errors.media && errors.media.message && (
        <ErrorText>{errors.media.message}</ErrorText>
      )}

      <InputTitle marginBottom={18} block isRequired>
        Reward
      </InputTitle>

      <RewardInput {...{ register, watch, control, errors }} d />

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
          {...{ register, watch, control }}
          namePrefix={`discountCodes[${i}]`}
          error={errors.discountCodes && errors.discountCodes[i]}
          removeSelf={() => removeDiscountCode(i)}
          {...code}
        />
      ))}

      <Button
        compact
        type="button"
        onClick={() => addDiscountCode(newDiscountCode())}
      >
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

      <Button
        type="Submit"
        primary
        minWidth={240}
        disabled={isSaveDisabled}
        data-tootik={isSaveDisabled ? 'Wait till the upload finished' : ''}
        isLoading={isSaving}
        onClick={() => setValue('publish', true)}
      >
        {isSaving && watch('publish')
          ? 'Publishing...'
          : 'Publish in the Marketplace'}
      </Button>

      <Button
        type="Submit"
        data-tootik={isSaveDisabled ? 'Wait till the upload finished' : ''}
        disabled={isSaveDisabled}
        onClick={() => setValue('publish', false)}
      >
        {isSaving && !watch('publish') ? 'Publishing...' : 'Publish hidden'}
      </Button>

      {!isNew && (
        <Button
          type="button"
          danger
          style={{ float: 'right' }}
          onClick={() => setIsDeleting(true)}
        >
          Delete
        </Button>
      )}
    </form>
  );
};

CampaignForm.propTypes = {
  campaign: PropTypes.object,
};

export default CampaignForm;
