import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

const runTests = async () => {
    console.log('--- Starting Backend Verification ---');

    // 1. Create Agent
    console.log('\n1. Testing Create Agent...');
    const agentData = {
        name: 'Test Agent',
        role: 'Tester',
        platform: 'CLI',
        system_instruction: 'You are a helpful test assistant. Respond with "Test Passed" if asked about your status.'
    };

    let agentId;

    try {
        const createRes = await fetch(`${BASE_URL}/agents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agentData)
        });
        const createdAgent = await createRes.json() as any;
        console.log('Create Result:', createdAgent);
        if (createdAgent.id) {
            agentId = createdAgent.id;
            console.log('✅ Agent Created');
        } else {
            console.error('❌ Failed to create agent');
            process.exit(1);
        }
    } catch (e) {
        console.error('❌ Create request failed', e);
        process.exit(1);
    }

    // 2. Chat with Agent
    console.log('\n2. Testing Chat with Agent...');
    try {
        const chatRes = await fetch(`${BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agentId: agentId,
                message: 'What is your status?'
            })
        });
        const chatResponse = await chatRes.json() as any;
        console.log('Chat Result:', chatResponse);
        if (chatResponse.text) {
            console.log('✅ Chat Successful');
        } else {
            console.error('❌ Chat failed');
        }
    } catch (e) {
        console.error('❌ Chat request failed', e);
    }

    console.log('\n--- Verification Complete ---');
};

runTests();
