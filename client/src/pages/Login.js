import React, { useState } from 'react';
import '../App.scss';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { gql, useLazyQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { useAuthDispatch } from '../context/auth';

const LOGIN_USER = gql`
  # queryのパラメータの型指定
  query login(
      $username: String!
      $password: String!
    ) {
    # queryの指定
    login(
        username: $username
        password: $password
    ) {
      # 返してほしいfieldの設定（ここを変えれば一部だけ取ってこれる）
      username
      email
      createdAt
      token
    }
  }
`;

const Login = (props) => {
    const [variables, setVariables] = useState({
        username: '',
        password: '',
    })
    const [errors, setErrors] = useState({})

    const dispatch = useAuthDispatch();    

    // userイベントの後に発火させるqueryはuseLazyQuery()で定義
    const [loginUser, { loading }] = useLazyQuery(LOGIN_USER, {
        onError: (err) => setErrors(err.graphQLErrors[0].extensions.errors),
        // loginが成功したらdataオブジェクトが返ってくる
        onCompleted(data) {
            console.log('data', data)
            console.log('data.login', data.login)
            
            dispatch({ type: 'LOGIN', payload: data.login })
            props.history.push('/')
        }
    });

    const submitLoginForm = e => {
        e.preventDefault()
        loginUser({ variables })
        console.log('variables: ', { variables })
    }

    return (
        <Row className='bg-white py-5 justify-content-center'>
            <Col sm={8} md={6} lg={4}>
                <h1 className='text-center'>Login</h1>
                <Form onSubmit={submitLoginForm}>
                    <Form.Group>
                        <Form.Label
                            className={errors.username && 'text-danger'}
                        >
                            {errors.username ?? 'Username'}
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={variables.username}
                            onChange={e => setVariables({ ...variables, username: e.target.value })}
                            className={errors.username && 'is-invalid'}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label
                            className={errors.password && 'text-danger'}
                        >
                            {errors.password ?? 'Password'}
                        </Form.Label>
                        <Form.Control
                            type="password"
                            value={variables.password}
                            onChange={e => setVariables({ ...variables, password: e.target.value })}
                            className={errors.password && 'is-invalid'}
                        />
                    </Form.Group>

                    <div className='text-center'>
                        <Button
                            variant="success"
                            type="submit"
                            className='mt-3 text-white'
                            disabled={loading}
                        >
                            {loading ? 'loading....' : 'Login'}
                        </Button>
                        <br />
                        <small>Don't have an account?
                            <Link to='/register'>Register</Link>
                        </small>
                    </div>
                </Form>
            </Col>
        </Row>
    )

}

export default Login
