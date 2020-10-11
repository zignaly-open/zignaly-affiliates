import React, {useContext, useEffect, useState} from 'react';
import Content from "../../common/Content";
import {appContext} from "../../context/app";
import {
  SERVICE_BASE,
  SERVICE_TYPE_MONTHLY_FEE,
  SERVICE_TYPE_PROFIT_SHARING,
  USER_AFFILIATE,
  USER_MERCHANT
} from "../../util/constants";
import {useParams} from "react-router-dom";
import useAsync from "react-use/lib/useAsync";
import Loader from "../../common/Loader";
import Fail from "../../common/Fail";
import {useFieldArray, useForm} from "react-hook-form";
import Input, {InputTitle, Separator} from "../../common/molecules/Input";
import DiscountCodeInput, {newDiscountCode} from "./inputs/DiscountCodeInput";
import Button from "../../common/Button";
import Muted from "../../common/atoms/Muted";
import RewardInput from "./inputs/RewardInput";
import FileInput from "../../common/molecules/FileInput";

const CampaignForm = ({campaign}) => {
  const { api, user } = useContext(appContext);
  const isNew = !campaign._id;
  const { handleSubmit, register, errors, watch, trigger, setError, setValue, control } = useForm({ defaultValues: campaign });
  const {
    fields: discountCodes,
    append: addDiscountCode,
    remove: removeDiscountCode
  } = useFieldArray({
    control,
    name: "discountCodes"
  });

  const {
    fields: media,
    append: addMedia,
    remove: removeMedia
  } = useFieldArray({
    control,
    name: "media"
  });

  useEffect(() => {
    register({ name: 'landingPage' }, { required: 'Required' })
  }, [])

  const onSubmit = data => {
    console.log(data);
  };

  console.error(errors)
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
              required: 'Required'
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

          <InputTitle marginBottom={18} block isRequired>
            Creatives
          </InputTitle>

          {/*{(media || []).map((image, i) => (*/}
          {/*  <FileInput*/}
          {/*    key={image.id}*/}
          {/*    register={register}*/}
          {/*    namePrefix={`discountCodes[${i}]`}*/}
          {/*    control={control}*/}
          {/*    error={errors.discountCodes && errors.discountCodes[i]}*/}
          {/*    removeSelf={() => removeDiscountCode(i)}*/}
          {/*    {...code}*/}
          {/*  />)*/}
          {/*)}*/}

          <InputTitle marginBottom={18} block isRequired>
            Reward
          </InputTitle>

          <RewardInput {...{register, watch, control, errors}} d/>

          <InputTitle marginBottom={18} block>
            Discount codes
          </InputTitle>

          {(!discountCodes || discountCodes.length === 0) && (
            <Muted block marginBottom={20}>No discount codes</Muted>
          )}

          {(discountCodes || []).map((code, i) => (
            <DiscountCodeInput
              key={code.id}
              register={register}
              namePrefix={`discountCodes[${i}]`}
              control={control}
              error={errors.discountCodes && errors.discountCodes[i]}
              removeSelf={() => removeDiscountCode(i)}
              {...code}
            />)
          )}


          <Button compact type="button" onClick={() => addDiscountCode(newDiscountCode())}>Add discount code</Button>

          <Separator />

          <Input
            type="textarea"
            name="termsAndConditions"
            rows={6}
            isRequired
            placeholder="Terms and conditions for this campaign"
            title="Terms and conditions"
            error={errors.termsAndConditions}
            useRef={register({ required: "Required" })}
          />

          <Button type={"Submit"}>Popizdovali</Button>

    </form>
  );
};

export default CampaignForm;
