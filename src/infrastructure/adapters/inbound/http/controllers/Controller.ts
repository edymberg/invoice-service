import { Mapper } from "../../../../../../framework/Mapper";
import { UseCaseHandler } from "../../../../../../framework/UseCaseHandler";

export class Controller {
  constructor(
    private readonly infaMapper: Mapper<JSON, RequestDTO>,
    private readonly handler: UseCaseHandler<RequestDTO, ResponseDTO>,
  ) {}
}
