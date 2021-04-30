import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import styled from 'styled-components';
import { withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import { appContext } from '../../contexts/app';
import { SERVICE_TYPE_MONTHLY_FEE } from '../../util/constants';
import ProfileForm from '../User/ProfileForm';
import DefaultCampaignForm from '../Campaigns/DefaultCampaignForm';
import { Separator } from '../../common/molecules/Input';
import Muted from '../../common/atoms/Muted';

const newCampaign = user => ({
  serviceType: SERVICE_TYPE_MONTHLY_FEE,
  termsAndConditions: user.termsAndConditions,
  discountCodes: [],
  isDefault: true,
  media: [],
});

const BorderLinearProgress = withStyles(theme => ({
  root: {
    height: 10,
    borderRadius: 5,
  },
  colorPrimary: {
    backgroundColor: theme.colors.violetTrans,
  },
  bar: {
    borderRadius: 5,
    backgroundColor: theme.colors.violet,
  },
}))(LinearProgress);

const MerchantOnboarding = () => {
  const { user } = useContext(appContext);
  const [dogeClickCounter, setDogeClickCounter] = useState(0);
  const toggleDoge = useCallback(
    (canOpenEasterEgg = true) =>
      setDogeClickCounter(v => {
        if (canOpenEasterEgg && v >= 7) {
          window.open('https://www.youtube.com/watch?v=sd4bqmP_460');
          return 0;
        }
        return v + 1;
      }),
    [],
  );
  const campaign = useMemo(() => newCampaign(user), [user]);

  useEffect(() => toggleDoge(false), [
    toggleDoge,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    user &&
      user.logoUrl &&
      user.zignalyId &&
      user.termsAndConditions &&
      user.aboutUs,
  ]);

  const stepIndex = useMemo(
    () =>
      user.logoUrl && user.zignalyId && user.termsAndConditions && user.aboutUs
        ? 1
        : 0,
    [user],
  );
  const steps = useMemo(
    () => [
      {
        title: 'Nice to meet you!',
        description: `Before you can start advertising your campaigns with Zignaly
         Affiliate, please tell us a little more about yourself`,
      },
      {
        title: 'Just one more thing',
        description: `Please create a default campaign that will be attributed somehow Kamila knows how `,
      },
    ],
    [],
  );

  return (
    <OnboardingWrapper>
      <ProgressWrapper>
        <Muted>Onboarding...</Muted>
        <BorderLinearProgress
          variant="determinate"
          value={33.333 * (stepIndex + 1)}
        />
      </ProgressWrapper>

      <OnboardingCenterWrap>
        {/* eslint-disable-next-line styled-components-a11y/no-noninteractive-element-to-interactive-role */}
        <GreeterImage
          onClick={toggleDoge}
          role="button"
          tabIndex="0"
          onKeyPress={toggleDoge}
          transformed={dogeClickCounter % 2}
          src="/doge.png"
          alt=""
        />
        <OnboardingInnerContent>
          <Greeter>
            <div>
              <h1>{steps[stepIndex].title}</h1>
              <p>{steps[stepIndex].description}</p>
            </div>
          </Greeter>

          <ProfileFormWrapper>
            <Separator />
            {stepIndex === 0 && (
              <ProfileForm hideFields={['name', 'email', 'changePassword']} />
            )}
            {stepIndex === 1 && <DefaultCampaignForm campaign={campaign} />}
          </ProfileFormWrapper>
        </OnboardingInnerContent>
      </OnboardingCenterWrap>
    </OnboardingWrapper>
  );
};

export default MerchantOnboarding;

const OnboardingWrapper = styled.div``;

const Greeter = styled.div`
  flex-direction: row;
  display: flex;
`;

const GreeterImage = styled.img`
  max-width: 150px;
  outline: none;
  transform: scaleX(${props => (props.transformed ? -1 : 1)})
    rotate(${props => (props.transformed ? 55 : -55)}deg);
  margin-right: 10px;
  object-fit: contain;
  margin-top: 15px;
  position: absolute;
  z-index: 1;
  left: -100px;
  @media (max-width: ${props => props.theme.breakpoints.desktop}) {
    display: none;
  }
`;

const ProfileFormWrapper = styled.div`
  margin: 0 auto;
`;

const ProgressWrapper = styled.div`
  margin: 10px auto 35px;
  max-width: 600px;

  span {
    display: block;
    text-align: center;
    margin-bottom: 10px;
  }
`;

const OnboardingCenterWrap = styled.div`
  max-width: 625px;
  position: relative;
  margin: 0 auto;
`;

const OnboardingInnerContent = styled.div`
  position: relative;
  z-index: 2;
  @media (min-width: ${props => props.theme.breakpoints.fablet}) {
    background: #fff;
    border: 1px solid ${props => props.theme.colors.blackTrans2};
    padding: 40px;
    border-radius: 4px;
    box-shadow: 0 1px 1px #fff;
    margin-bottom: 40px;
  }
  margin-left: 10px;
  margin-right: 10px;
  padding: 20px;

  h1 {
    font-size: 1.4rem;
    line-height: 4rem;
    margin-top: 0;
    font-weight: 600;
    text-shadow: 1px 1px #fff;
  }

  p {
    line-height: 1.5rem;
    font-size: 1.15rem;
  }
`;
