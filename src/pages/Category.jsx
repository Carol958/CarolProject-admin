import React from 'react';

const Category = () => {
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Category Management</h2>
            <div className="bg-white p-4 rounded shadow">
                <p>This is the Category Management page.</p>
                <div className="mt-4">
                    {/* Future table or list of categories will go here */}
                    <p className="text-gray-500">List of categories will be displayed here.</p>
                </div>
            </div>
        </div>
    );
};

export default Category;
