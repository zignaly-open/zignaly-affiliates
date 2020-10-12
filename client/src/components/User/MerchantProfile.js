import React, {useContext} from 'react';
import {useParams} from 'react-router-dom';
import useAsync from 'react-use/lib/useAsync';
import Content from '../../common/Content';
import {appContext} from '../../context/app';
import Loader from '../../common/Loader';
import Fail from '../../common/Fail';
import MerchantCard from "../../common/molecules/MerchantCard";
import WallOfText from "../../common/molecules/WallOfText";

const MerchantProfile = () => {
  const {api} = useContext(appContext);
  const {id} = useParams();
  const {loading, error, value: merchant} = useAsync(
    async () => api.get(`user/merchant/${id}`),
    [],
  );

  return (
    <Content title={merchant ? `Merchant: ${merchant.name}` : 'Merchant'}>
      {loading && <Loader/>}
      {error && <Fail/>}
      {!loading && merchant && (
        <>
          <MerchantCard imageSize={200}
                        content={(
                          <>
                            <WallOfText text={merchant.aboutUs} title={null}/>


                            {/*<Textarea calue />*/}
                          </>
                        )}
                        merchant={merchant}/>
        </>
      )}
    </Content>
  );
};

export default MerchantProfile;
