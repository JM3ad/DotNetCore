import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

export default class Home extends React.Component<RouteComponentProps<{}>, {}> {
    public render() {
        return <div>
            <h1 className="text-center">Welcome, Captains of Gondor</h1>

            <p>The enemy have been preparing for war and just as we have been burying spies deep within their ranks, we believe they have also infiltrated our own - study your compatriots carefully. </p>
            <p>Osgiliath must hold out the week if we are to give our main forces enough time to prepare for the battles to come - yet our fortifications will not last many frontal assaults. We must use any intelligence we can gather to prepare ambushes to destroy the enemy raiding parties before they can bring their weaponry to bear against our walls.</p>

            <h3>Rules</h3>
            <ul>
                <li>Each day you will receive intelligence relating to the enemies planned assault</li>
                <li>Share this intelligence with your colleagues and determine the best routes to ambush</li>
                <li>We only have the forces available to ambush two routes</li>
                <li>The captains will collectively vote on the best routes to ambush</li>
                <li>Three direct assaults upon Osgiliath will be all it takes for the enemy to break through our walls</li>
                <li>Unfortunately, recent activity suggests that the enemy has a spy within our council; one of your colleagues will be spreading disinformation.</li>
                <li>Find them, and extract the truth from them.</li>
                <li>And remember, your sources may not be perfect...</li>
            </ul>
        </div>;
    }
}
