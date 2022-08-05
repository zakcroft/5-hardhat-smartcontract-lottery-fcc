import { run } from "hardhat";

export async function verify(contractAddress: string, args: any[]) {
  console.log("Verifying contracts");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified");
    } else {
      console.log(e);
    }
  }
}
