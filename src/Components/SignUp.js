import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp = (props) => {

    const [user, setUser] = useState({name: "", email: "", password: "", cpassword: ""});
    let navigate = useNavigate();
    const {name, email, password} = user;
    const handleSubmit = async (e) => {
            e.preventDefault();
            const response = await fetch(`http://localhost:3600/api/auth/createuser`, {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({name, email, password}),
            });

            const json = await response.json();
            json.success ? (() => {localStorage.setItem('token', json.auth_token); props.showAlert("Account Created Successfully", "success", true); navigate("/");})() : props.showAlert(`Error: ${json.error ? json.error : "Internal Server Error"}`, "danger", false)()
    }

    const onChange = (e) => {
        setUser({...user , [e.target.name]: e.target.value})
        }

  return (
    <div className='container my-3'>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
            <label htmlFor="exampleInputName1" className="form-label">Name</label>
            <input type="text" className="form-control" id="exampleInputName1"  name="name" aria-describedby="nameHelp" value={user.name} onChange={onChange} required minLength={3}/>
        </div>
        <div className="mb-3">
            <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
            <input type="email" className="form-control" id="exampleInputEmail1"  name="email" aria-describedby="emailHelp" value={user.email} onChange={onChange} required/>
        </div>
        <div className="mb-3">
            <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
            <input type="password" className="form-control" id="exampleInputPassword1" name="password" value={user.password} onChange={onChange} required minLength={9}/>
        </div>
        <div className="mb-3">
            <label htmlFor="exampleInputCPassword1" className="form-label">Confirm Password</label>
            <input type="password" className="form-control" id="exampleInputCPassword1" name="cpassword" value={user.cpassword} onChange={onChange} required minLength={9}/>
            <div id="passwordHelpBlock" className="form-text text-warning">
                {user.password===user.cpassword ? "" : "Password and Confirm Password must be matching!"}
            </div>
        </div>
        <button disabled={user.password.length < 9 || user.name.length < 3 || user.password!==user.cpassword} type="submit" className="btn btn-primary">Submit</button>
        </form>
    </div>
  );
}

export default SignUp;
