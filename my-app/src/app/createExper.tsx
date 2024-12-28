import React from 'react';

const CreateExperiment: React.FC = () => {
    return (
        <div>
            <h1>Create Experiment</h1>
            <form>
                <div>
                    <label htmlFor="experimentName">Experiment Name:</label>
                    <input type="text" id="experimentName" name="experimentName" />
                </div>
                <div>
                    <label htmlFor="description">Description:</label>
                    <textarea id="description" name="description"></textarea>
                </div>
                <button type="submit">Create</button>
            </form>
        </div>
    );
};

export default CreateExperiment;