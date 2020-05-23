import React, { useContext } from 'react';
import { Redirect } from '@reach/router';
import { UserContext } from '../App';

export default () => {
  const [user] = useContext(UserContext);
  if (!user.accessToken) {
    return <Redirect from="" to="/login" noThrow />;
  }
  return <div>This is the content</div>;
};
