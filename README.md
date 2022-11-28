
This is project page for [AdaStamp](https://cardano.ideascale.com/c/idea/414067).

The landing page is hosted on [Github Pages](https://pages.github.com) ([documentation](https://docs.github.com/en/pages)).

---
## Functionality
#### Signing and storing documents

The application will allow uploading a document of any format. It will be stored on IPFS, and pinned by the IPFS service (e.g. [Storj IPFS Pinning Service](https://docs.storj.io/dcs/how-tos/storj-ipfs-pinning-service-beta/)) for a period (in years) specified in a parameter, with the ability to further extend it as required by the local archive policy.

Then, the document owner will specify (by entering or choosing from an address list):

- a list of users (Cardano wallets or just e-mail addresses) who are to sign off the document,
- a list of users (e-mail addresses) who will be notified as soon the document is signed by all parties.


Each signer will be notified of the document to be signed by the StreamCardano notification service. If a user were specified by e-mail address, the application would allow him to connect to the existing Cardano wallet or create a new one. Then, each signer will be able to sign off the document, and the signature will be stored on the blockchain. If necessary, all signers will be able to sign off the document simultaneously at the same time, for example, when participating in an online meeting with a notary, allowing the notary to immediately check the validity of the signatures.

As soon as all signers have signed off the document, users from the second list will be notified by the StreamCardano notification service that the document has been signed.

#### KYC procedure

The legal validity of a signature will be established if the signing wallets have passed a KYC procedure provided by [Blockpass solution](https://www.blockpass.org/2022/04/20/blockpass-partners-with-emurgo-to-provide-on-chain-kyc-to-cardano-blockchain-ecosystem). The procedure will include:

- verification of the authenticity of the customer's identity document,
- validation of the customer's name and date of birth against data printed on the identity document,
- face match with the identity document photo.

The KYC policy will not require an AML check, as document signing has no relevance to possible money laundering. AML will be optional since a signer may accept payment upon signing a document (see later). A user will have to perform KYC just once and then can use the verified Cardano wallet when signing documents. The signature stored on the blockchain will include (encrypted) basic data of signers (first name, surname, no. of identity document, and date of birth) so that users with granted access to the document will know by whom it has been signed. According to the [Blockpass vendor](https://www.blockpass.org/2020/10/20/limited-offer-kyc-aml-screening-sale), the price of KYC is "starting at $1.0 per individual screen".

#### Signing PDF documents
We establish special support for signing PDF documents, which is the most often used form of electronic legal documents. A signature made by a signer and stored on Cardano can be inserted into the PDF document itself as a visual signature. This will produce a self-contained PDF with a signature, which will be the same as the one stored on Cardano. A user may use either a source, unsigned PDF together with a Cardano signature, or a self-contained PDF with an embedded signature.
#### Document templates

For organizations that sign large numbers of documents of the same content, differing just in personal details, the solution will offer the ability to prepare a document template - a document with predefined content and fields to be filled automatically with personal data. As personal data of multiple signers will be given, e.g. in a CSV file, the solution will generate a separate, personalized PDF document for each signer (similarly to the mail-merge function in word processors) and will automatically start a signing process for it (including necessary notifications).

#### Signing workflows

Another feature significant for large organizations is signing workflow, which will include:

- defining the order of signers,
- allowing specific signers to make decisions (e.g. approve or reject the document),
- choosing a workflow path depending on certain conditions based on document contents (for example, contracts with a value exceeding a given amount must be additionally signed by the CEO),
- making a payment at a certain step of the workflow (e.g. when both parties have signed a delivery protocol),
- calling a specified smart contract at a certain step of the workflow,
- performing certain automatic actions.

An automatic action that could be performed at a given workflow step, will be inserting the signer's and signature data into a Google Spreadsheet. The solution will be integrated with Google Spreadsheet, allowing to set up a connection with certain spreadsheet, and insert rows into the spreadsheet at certain workflow step (for example when both parties have signed a document).

Another kind of actions available in workflows will allow to:

- make Escrow deposit while signing a document,
- automatically release a deposit at a certain workflow step (e.g. when delivery of agreed goods or services has been signed).

Workflows can also be recurring, which means that after signing a contract, the following workflow steps (e.g. signing of a delivery protocol or issuing an invoice) will be performed periodically, e.g. once a month.

#### The building blocks of the solution

The solution will consist of the following elements:

- a smart contract that manages signatures of documents,
- a decentralized document storage on IFPS,
- a frontend application that allows uploading and signing documents,
- a notification service running on [StreamCardano](https://cardano.ideascale.com/c/idea/396549), sending e-mail notifications related to document status.

Each signing workflow will be implemented as a separate smart contract that embodies and codifies the specific workflow rules. The solution will include a framework for developing such smart contracts, i.e. a smart contract generator that will generate the smart contract code based on a configuration file that specifies the order of signers, as well as possible human and automatic decisions and actions. Recurring workflows will be separate sub-contracts periodically generated by the main workflow contract.

# Register your interest

Do you want to join our mailing list, and closed beta? [Register here](mail-to:adastamp@migamake.com)?
