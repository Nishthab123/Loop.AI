const { v4: uuidv4 } = require('uuid');

class DataStore {
    constructor() {
        this.ingestions = new Map();
        this.processingQueue = [];
        this.isProcessing = false;
    }

    createIngestion(ids, priority) {
        const ingestionId = uuidv4();
        const batches = this.createBatches(ids);
        
        this.ingestions.set(ingestionId, {
            ingestionId,
            status: 'yet_to_start',
            priority,
            createdTime: Date.now(),
            batches
        });

        this.enqueueBatches(ingestionId, batches, priority);
        this.startProcessing();
        
        return ingestionId;
    }

    createBatches(ids) {
        const batches = [];
        for (let i = 0; i < ids.length; i += 3) {
            batches.push({
                batchId: uuidv4(),
                ids: ids.slice(i, i + 3),
                status: 'yet_to_start'
            });
        }
        return batches;
    }

    enqueueBatches(ingestionId, batches, priority) {
        batches.forEach(batch => {
            this.processingQueue.push({
                ingestionId,
                batch,
                priority,
                createdTime: Date.now()
            });
        });
        this.processingQueue.sort((a, b) => {
            if (a.priority === b.priority) {
                return a.createdTime - b.createdTime;
            }
            const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    async startProcessing() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        while (this.processingQueue.length > 0) {
            const item = this.processingQueue[0];
            const ingestion = this.ingestions.get(item.ingestionId);
            
            if (ingestion) {
                item.batch.status = 'triggered';
                this.updateIngestionStatus(item.ingestionId);
                
                await this.processBatch(item.batch);
                item.batch.status = 'completed';
                this.updateIngestionStatus(item.ingestionId);
                
                this.processingQueue.shift();
                await new Promise(resolve => setTimeout(resolve, 5000)); // Rate limit
            }
        }

        this.isProcessing = false;
    }

    async processBatch(batch) {
        const processPromises = batch.ids.map(id => 
            new Promise(resolve => {
                setTimeout(() => {
                    resolve({ id, data: "processed" });
                }, 1000);
            })
        );
        await Promise.all(processPromises);
    }

    updateIngestionStatus(ingestionId) {
        const ingestion = this.ingestions.get(ingestionId);
        if (!ingestion) return;

        const allCompleted = ingestion.batches.every(b => b.status === 'completed');
        const anyTriggered = ingestion.batches.some(b => b.status === 'triggered');
        const allYetToStart = ingestion.batches.every(b => b.status === 'yet_to_start');

        if (allCompleted) ingestion.status = 'completed';
        else if (anyTriggered) ingestion.status = 'triggered';
        else if (allYetToStart) ingestion.status = 'yet_to_start';
    }

    getStatus(ingestionId) {
        return this.ingestions.get(ingestionId);
    }
}

module.exports = new DataStore();