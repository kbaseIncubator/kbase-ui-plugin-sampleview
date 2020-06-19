import React from 'react';
import { Table, Tooltip, Alert, message } from 'antd';
import { History, MiniSample } from './data';
import './style.css';
import UserCard from '../UserCard/view';
import { User } from '../sample/data';
import Comparator from './Comparator';

export interface HistoryToolProps {
    history: History;
}

interface HistoryToolState {
    selectedSamples: Array<MiniSample>;
}

function partitionArray<T>(arr: Array<T>, partitioner: (item: T) => boolean) {
    const original: Array<T> = [];
    const separated: Array<T> = [];
    arr.forEach((item: T) => {
        if (partitioner(item)) {
            separated.push(item);
        } else {
            original.push(item);
        }
    });
    return [original, separated];
}

export default class HistoryTool extends React.Component<HistoryToolProps, HistoryToolState> {
    constructor(props: HistoryToolProps) {
        super(props);
        this.state = {
            selectedSamples: []
        };
    }

    onSelectSample(selectedSample: MiniSample) {
        if (this.state.selectedSamples.length > 0) {
            const [selectedSamples, removedSamples] = partitionArray<MiniSample>(this.state.selectedSamples, (sample: MiniSample) => {
                return sample.version === selectedSample.version;
            });
            if (removedSamples.length > 0) {
                this.setState({
                    selectedSamples
                });
                return;
            }
            if (this.state.selectedSamples.length === 2) {
                message.warning('Unselect a version first');
                return;
            }
        }
        const newSamples = [...this.state.selectedSamples, selectedSample].sort((a: MiniSample, b: MiniSample) => {
            return a.version - b.version;
        });
        this.setState({
            selectedSamples: newSamples
        });
    }

    renderHistoryTable() {
        if (this.props.history.length === 0) {
            return;
        }
        return <Table<MiniSample>
            dataSource={this.props.history}
            className="AntTable-FullHeight"
            rowKey="version"
            size="small"
            scroll={{ y: '100%' }}
            pagination={false}
            rowSelection={{
                type: 'checkbox',
                hideSelectAll: true,
                selectedRowKeys: this.state.selectedSamples.map((sample) => {
                    return sample.version;
                }),
                onSelect: this.onSelectSample.bind(this)
            }}
        >

            <Table.Column
                title="Version"
                dataIndex="version"
                width="6em"
                ellipsis={true}
            />

            <Table.Column
                title="Saved"
                dataIndex="savedAt"
                render={(savedAt: number) => {
                    const timestamp = Intl.DateTimeFormat('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }).format(savedAt);
                    // const date = Intl.DateTimeFormat('en-US', {
                    //     year: 'numeric',
                    //     month: 'numeric',
                    //     day: 'numeric'
                    // }).format(savedAt);
                    return <Tooltip title={timestamp}>
                        <span>{timestamp}</span>
                    </Tooltip>;
                }}
            />

            <Table.Column
                title="By"
                dataIndex="savedBy"
                width="10em"
                ellipsis={true}
                render={(savedBy: User) => {
                    return <Tooltip title={<UserCard user={savedBy} />}>
                        <span>{savedBy.username}</span>
                    </Tooltip>;
                }}
            />
        </Table>;
    }

    renderSample(sample: MiniSample) {
        return <div className="InfoTable -fullheight">
            <div>
                <div>
                    Version
                </div>
                <div>
                    {sample.version}
                </div>
            </div>
        </div>;
    }

    renderColumn(columnNumber: number) {
        if (!this.state.selectedSamples[columnNumber - 1]) {
            return <Alert type="info" message="No sample selected" />;
        }
        return this.renderSample(this.state.selectedSamples[columnNumber - 1]);
    }

    renderComparison() {
        return <Comparator selectedSamples={this.state.selectedSamples} />;
    }

    renderHistory() {
        return <div className="Col -stretch">
            <div className="Row">
                <div className="Col -span1" style={{ marginRight: '10px' }}>
                    <div className="-title">History</div>
                </div>
                <div className="Col -span2">
                    <div className="-title">Diff</div>
                </div>
            </div>
            <div className="Row -stretch">
                <div className="Col -span1" style={{ marginRight: '10px' }}>
                    {this.renderHistoryTable()}
                </div>
                <div className="Col -span2">
                    {this.renderComparison()}
                </div>
            </div>
        </div>;
    }

    render() {
        return <div className="History" data-testid="history">
            {this.renderHistory()}
        </div>;
    }
}