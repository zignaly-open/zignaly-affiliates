import React, { useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Controller, useForm } from 'react-hook-form';
import { appContext } from '../../context/app';
import Button from '../../common/atoms/Button';
import Input from '../../common/molecules/Input';
import Select from '../../common/molecules/Select';
import { setFormErrors, SUBTRACK_REGEX } from '../../util/form';
import Code from '../../common/atoms/Code';
import { affiliateCampaignContext } from '../../context/affiliateCampaign';

const CampaignAffiliateViewDiscountCodesForm = () => {
  const { api } = useContext(appContext);
  const { campaign, reloadCampaignSilently } = useContext(
    affiliateCampaignContext,
  );
  const [loading, setLoading] = useState(false);
  const generateOptions = useMemo(
    () =>
      campaign.discountCodes.map(({ code }) => ({ value: code, label: code })),
    [campaign],
  );
  const { handleSubmit, register, errors, control, setError, watch } = useForm(
    {},
  );

  const onSubmit = async values => {
    setLoading(true);
    try {
      await api.post(`campaign/marketplace/${campaign._id}/code`, values);
      reloadCampaignSilently();
    } catch (error) {
      setFormErrors(error, setError);
    }
    setLoading(false);
  };

  const code = watch('code');
  const subtrack = watch('subtrack');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Wrap>
        <Controller
          as={
            <Select
              options={generateOptions}
              error={errors.code}
              title="Discount Code"
            />
          }
          name="code"
          title="Type"
          control={control}
          defaultValue={campaign.discountCodes[0]?.code}
        />

        <Input
          type="text"
          name="subtrack"
          placeholder="Your subtrack"
          isRequired
          inline
          title="Subtrack"
          error={errors.subtrack}
          useRef={register({
            required: 'Required',
            pattern: {
              value: SUBTRACK_REGEX,
              message: 'Letters, digits and underscores allowed only',
            },
          })}
        />
      </Wrap>

      {subtrack && (
        <>
          <p>Your code:</p>
          <Code>
            {code}
            {subtrack}
          </Code>
          <p />
        </>
      )}

      <Button primary type="submit" isLoading={loading}>
        Generate code
      </Button>
    </form>
  );
};

CampaignAffiliateViewDiscountCodesForm.propTypes = {};

const Wrap = styled.div`
  display: flex;
  flex-wrap: wrap;

  & > * {
    margin-top: 10px;
  }
`;

export default CampaignAffiliateViewDiscountCodesForm;
