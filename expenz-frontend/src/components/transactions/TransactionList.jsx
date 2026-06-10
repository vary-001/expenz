// src/components/transactions/TransactionList.jsx
import React from 'react';
import TransactionItem from './TransactionItem';
import EmptyState from '../common/EmptyState';

const TransactionList = ({ transactions = [], onEdit, onDelete, emptyAction }) => {
  if (!transactions.length) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Start tracking your expenses to get insights into your spending patterns."
        actionLabel="Add Transaction"
        onAction={emptyAction}
      />
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx, i) => (
        <TransactionItem
          key={tx._id || i}
          transaction={tx}
          onEdit={onEdit}
          onDelete={onDelete}
          index={i}
        />
      ))}
    </div>
  );
};

export default TransactionList;