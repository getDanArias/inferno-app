// src/components/User/User.js

import Component from 'inferno-component';
import './User.css';

class User extends Component {
  render(props) {
    let profile = props.profile;
    let idp = profile.sub.split('|')[0];

    return(
      <div className="User" title={idp}>
        <img src={profile.picture} alt={profile.name} />
        <span>{profile.name}</span>
      </div>
    );
  }
}

export default User;
