import LineChart from "../chart/lineChart";
import BarChart from "../chart/barChart";
import PieChart from "../chart/pieChart";

const Demo = () => {
    return (
        <div className="card card-round">
            <div className="card-body pb-0">
                <div className="h1 fw-bold float-end text-primary">+5%</div>
                <h2 className="mb-2">17</h2>
                <p className="text-muted">Utilisateurs Actif</p>
                <div className="pull-in sparkline-fix">
                    <PieChart />
                </div>
            </div>
        </div>
    );
};

export default Demo;