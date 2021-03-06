/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { MyPrivateAsset } from './my-private-asset';
const myCollectionName: string = 'myCollection';

@Info({title: 'MyPrivateAssetContract', description: 'My Private Smart Contract' })
export class MyPrivateAssetContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async myPrivateAssetExists(ctx: Context, myPrivateAssetId: string): Promise<boolean> {
        const buffer = await ctx.stub.getPrivateData(myCollectionName, myPrivateAssetId);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction()
    public async createMyPrivateAsset(ctx: Context, myPrivateAssetId: string): Promise<void> {
        const exists = await this.myPrivateAssetExists(ctx, myPrivateAssetId);
        if (exists) {
            throw new Error(`The private asset ${myPrivateAssetId} already exists`);
        }

        const privateAsset: MyPrivateAsset = new MyPrivateAsset();

        const transientData = await ctx.stub.getTransient();
        if (transientData.size === 0 || !transientData.has('privateValue')) {
            throw new Error('The privateValue key was not specified in transient data. Please try again.');
        }
        privateAsset.privateValue = transientData.get('privateValue').toString('utf8');

        await ctx.stub.putPrivateData(myCollectionName, myPrivateAssetId, Buffer.from(JSON.stringify(privateAsset)));
    }

    @Transaction(false)
    @Returns('myPrivateAsset')
    public async readMyPrivateAsset(ctx: Context, myPrivateAssetId: string): Promise<string> {
        const exists = await this.myPrivateAssetExists(ctx, myPrivateAssetId);
        if (!exists) {
            throw new Error(`The private asset ${myPrivateAssetId} does not exist`);
        }
        let privateDataString: string;
        const privateData: Buffer = await ctx.stub.getPrivateData(myCollectionName, myPrivateAssetId);
        privateDataString = JSON.parse(privateData.toString());
        return privateDataString;
    }

    @Transaction()
    public async updateMyPrivateAsset(ctx: Context, myPrivateAssetId: string): Promise<void> {
        const exists = await this.myPrivateAssetExists(ctx, myPrivateAssetId);
        if (!exists) {
            throw new Error(`The private asset ${myPrivateAssetId} does not exist`);
        }

        const privateAsset: MyPrivateAsset = new MyPrivateAsset();

        const transientData = await ctx.stub.getTransient();
        if (transientData.size === 0 || !transientData.has('privateValue')) {
            throw new Error('The privateValue key was not specified in transient data. Please try again.');
        }
        privateAsset.privateValue = transientData.get('privateValue').toString('utf8');

        await ctx.stub.putPrivateData(myCollectionName, myPrivateAssetId, Buffer.from(JSON.stringify(privateAsset)));
    }

    @Transaction()
    public async deleteMyPrivateAsset(ctx: Context, myPrivateAssetId: string): Promise<void> {
        const exists = await this.myPrivateAssetExists(ctx, myPrivateAssetId);
        if (!exists) {
            throw new Error(`The private asset ${myPrivateAssetId} does not exist`);
        }
        await ctx.stub.deletePrivateData(myCollectionName, myPrivateAssetId);
    }

    @Transaction(false)
    public async verifyMyPrivateAsset(ctx: Context, myPrivateAssetId: string, hashToVerify: string): Promise<boolean> {

        const pdHashBytes: Buffer = await ctx.stub.getPrivateDataHash(myCollectionName, myPrivateAssetId);
        if (pdHashBytes.length === 0) {
            throw new Error('No private data hash with the key: ' + myPrivateAssetId);
        }

        const actualHash: string = pdHashBytes.toString('hex');

        if (hashToVerify === actualHash) {
            return true;
        } else {
            throw new Error(`No match found for ${hashToVerify}. Please try again.`);
        }
    }

}
