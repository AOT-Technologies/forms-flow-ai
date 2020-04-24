import React from 'react'
import { Table } from 'react-bootstrap'

const View = () => {
    return (
        <Table responsive >
            <tbody>
                <tr>
                    <td className="border-0">Task Id</td>
                    <td className="border-0">:</td>
                    <td className="border-0">536673</td>
                </tr>
                <tr>
                    <td className="border-0">Task Title</td>
                    <td className="border-0">:</td>
                    <td className="border-0">Verify Member</td>
                </tr>
                <tr>
                    <td className="border-0">Task Owner</td>
                    <td className="border-0">:</td>
                    <td className="border-0">Vicky</td>
                </tr>
                <tr>
                    <td className="border-0">Primary Applicant</td>
                    <td className="border-0">:</td>
                    <td className="border-0">Robert</td>
                </tr>
                <tr>
                    <td className="border-0">Submitted On</td>
                    <td className="border-0">:</td>
                    <td className="border-0">24 March 2020</td>
                </tr>
            </tbody>
        </Table>
    )
}

export default View