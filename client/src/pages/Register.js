import React, { useState } from 'react';
import '../App.scss';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { gql, useMutation } from '@apollo/client';
import { useHistory } from 'react-router';

const REGISTER_USER = gql`
  mutation register(
      $username: String!
      $email: String!
      $password: String!
      $confirmPassword: String!
    ) {
    register(
        username: $username
        email: $email
        password: $password
        confirmPassword: $confirmPassword
    ) {
      username
      email
      createdAt
    }
  }
`;

const Register = (props) => {
    const history = useHistory();
    
    const [variables, setVariables] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
    })
    const [errors, setErrors] = useState({})
    const [registerUser, { loading }] = useMutation(REGISTER_USER, {
        update: (_, __) => props.history.push('/login'),
        onError: (err) => {
            const myKey = Object.keys(err.graphQLErrors[0].extensions.errors).join('.').split('.')[1]
            const myValue = `${Object.keys(err.graphQLErrors[0].extensions.errors).join('.').split('.')[1]} is already taken`
            const obj = {}
            obj[myKey] = myValue;
            // console.log(obj)

            if (Object.keys(err.graphQLErrors[0].extensions.errors).join('.').indexOf('users.') !== -1) {
                setErrors(obj);
            } else {
                setErrors(err.graphQLErrors[0].extensions.errors)
            }
        },
    });

    const submitRegisterForm = e => {
        e.preventDefault()
        registerUser({ variables })
        console.log('variables: ', variables)
    }

    const link = (path) => {
        history.push(path);
    }

    return (
        <Row className='bg-white py-5 justify-content-center'>
            <Col sm={8} md={6} lg={4}>
                <h1 className='text-center'>Register</h1>
                <Form onSubmit={submitRegisterForm}>
                    <Form.Group>
                        <Form.Label
                            className={errors.email && 'text-danger'}
                        >
                            {errors.email ?? 'Email address'}
                        </Form.Label>
                        <Form.Control
                            type="email"
                            value={variables.email}
                            onChange={e => setVariables({ ...variables, email: e.target.value })}
                            className={errors.email && 'is-invalid'}
                        />
                    </Form.Group>

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

                    <Form.Group>
                        <Form.Label
                            className={errors.confirmPassword && 'text-danger'}
                        >
                            {errors.confirmPassword ?? 'Confirm password'}
                        </Form.Label>
                        <Form.Control
                            type="password"
                            value={variables.confirmPassword}
                            onChange={e => setVariables({ ...variables, confirmPassword: e.target.value })}
                            className={errors.confirmPassword && 'is-invalid'}
                        />
                    </Form.Group>

                    <div className='text-center'>
                        <Button
                            variant="success"
                            type="submit"
                            className='mt-3 text-white'
                            disabled={loading}
                        >
                            {loading ? 'loading....' : 'Register'}
                        </Button>
                        <br />
                        <small>Already have an account?
                            <span
                                onClick={() => link('/login')}
                                className='link'
                            >
                                Login
                            </span>
                        </small>
                    </div>
                </Form>
            </Col>
        </Row>
    )
    
}

export default Register
