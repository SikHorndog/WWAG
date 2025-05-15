import { useState } from "react";
import "./App.css";

function App() {
  const [machineName, setMachineName] = useState("");
  const [opData, setOpData] = useState("");
  const [output, setOutput] = useState("");

  const expandCIOList = (input) => {
    const items = input.split(",").map(s => s.trim());
    const result = [];
    items.forEach(item => {
      if (item.includes("-")) {
        const [start, end] = item.split("-").map(Number);
        for (let i = start; i <= end; i++) {
          result.push(i);
        }
      } else {
        result.push(Number(item));
      }
    });
    return result;
  };

  const generateScript = () => {
    const blocks = opData.trim().split(/\n+/);
    let fullScript = "";

    blocks.forEach(block => {
      const [opName, cioLine] = block.split(":");
      const cios = expandCIOList(cioLine);
      const productVar = `${machineName}_${opName}Product`;
      const autoVar = `${machineName}_${opName}AutoNonAuto`;

      let script = `SQL_VariableOpNumber = "${opName}";\nSQL_VariableProduct = ${productVar};\nSQL_VariableAutoNonAuto = ${autoVar};\n`;

      cios.forEach(cio => {
        script += `\nIF ${machineName}_CIO_${cio} <> 0 THEN\n  SQL_Variable_AlarmWordNumber = "CIO${cio}";\n  SQL_Variable_AlarmBitsInDecimal = ${machineName}_CIO_${cio};\n  SQLInsert(SQL_ProductionData_ConnID, "EPBMachineAlarms", "EPBMachineAlarmsBindlist");\nENDIF;\n`;
      });

      fullScript += `{---------------------------------------------------------------------------------------------------------------------------}\n\n${script}\n{---------------------------------------------------------------------------------------------------------------------------}\n\n`;
    });

    setOutput(fullScript.trim());
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      alert("Script copied to clipboard!");
    } catch (err) {
      alert("Failed to copy!");
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <input
        style={{ width: '100%', marginBottom: 10 }}
        placeholder="Machine Name (e.g., AS33PerfTest)"
        value={machineName}
        onChange={(e) => setMachineName(e.target.value)}
      />
      <textarea
        rows={6}
        style={{ width: '100%', marginBottom: 10 }}
        placeholder={`Enter each OP on a new line as: OpNumber: CIOs\nExample:\nOp115: 4012-4019, 4021-4024, 4031-4034\nOp120: 6000-6005, 6010`}
        value={opData}
        onChange={(e) => setOpData(e.target.value)}
      />
      <div style={{ marginBottom: 10 }}>
        <button onClick={generateScript} style={{ marginRight: 10 }}>Generate Script</button>
        <button onClick={copyToClipboard}>Copy to Clipboard</button>
      </div>
      <textarea rows={30} style={{ width: '100%', fontFamily: 'monospace' }} value={output} readOnly />
    </div>
  );
}

export default App;
