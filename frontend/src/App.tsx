import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter as Router, Route, Switch,} from "react-router-dom";
import NavBar from "./components/NavBar"
import AboutPage from "./components/AboutPage"
import HomePage from "./components/HomePage"


class App extends React.Component<{}, {}> {


    render() {
        return (
            <Router basename={process.env.PUBLIC_URL}>
                <div>
                    <NavBar/>

                    <main role="main" className="container">
                        <Switch>
                            <Route exact path="/" component={HomePage}/>
                            <Route exact path="/about" component={AboutPage}/>
                        </Switch>
                    </main>


                </div>
            </Router>
        )


    }
}


export default App;
